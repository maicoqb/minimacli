import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createHarness, type HarnessDescriptor, type HarnessStatus } from '../lib/harness';
import { parseMessageEvent, type ParseMessageEventResult } from '../lib/events';

export type ChatMessage = { role: 'user' | 'assistant'; text: string };

type HarnessContextValue = {
  status: HarnessStatus;
  ready: boolean;
  descriptor: HarnessDescriptor | null;
  url: string;
  retry: () => void;
  prompt: (text: string) => Promise<void>;
  messages: ChatMessage[];
};

type DeltaAction = Extract<ParseMessageEventResult, { kind: 'assistant-delta' }>;
type CompleteAction = Extract<ParseMessageEventResult, { kind: 'assistant-complete' }>;

function mutateAssistantMessage(
  action: DeltaAction | CompleteAction
): (current: ChatMessage[]) => ChatMessage[] {
  return (current) => {
    const last = current[current.length - 1];
    if (last?.role !== 'assistant') {
      return [...current, { role: 'assistant', text: action.text }];
    }

    const text =
      action.kind === 'assistant-delta' ? last.text + action.text : action.text;
    const updated = { ...last, text };
    const copy = current.slice();
    copy[copy.length - 1] = updated;
    return copy;
  };
}

const HarnessContext = createContext<HarnessContextValue | null>(null);

export function HarnessProvider({ url, children }: { url: string; children: ReactNode }) {
  const harness = useMemo(() => createHarness(url), [url]);
  const [status, setStatus] = useState<HarnessStatus>('checking');
  const [descriptor, setDescriptor] = useState<HarnessDescriptor | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const retry = useCallback(async () => {
    setStatus('checking');
    try {
      const value = await harness.describe();
      setDescriptor(value);
      setStatus('up');
    } catch {
      setStatus('down');
    }
  }, [harness]);

  useEffect(() => {
    retry();
  }, [retry]);

  const ensureSession = useCallback(async () => {
    try {
      const session = await harness.createSession(process.cwd());
      setSessionId(session.sessionId);
    } catch {
      setStatus('down');
    }
  }, [harness]);

  useEffect(() => {
    if (status === 'up' && !sessionId) {
      ensureSession();
    }
  }, [status, sessionId, ensureSession]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    const controller = new AbortController();
    harness.streamEvents(
      sessionId,
      (frame) => {
        if (frame.type !== 'session/event') {
          return;
        }
        const action = parseMessageEvent(frame.event);
        switch (action?.kind) {
          case 'assistant-delta':
          case 'assistant-complete':
            setMessages(mutateAssistantMessage(action));
            break;
        }
      },
      controller.signal
    );
    return () => {
      controller.abort();
    };
  }, [harness, sessionId]);

  const prompt = useCallback(
    async (text: string) => {
      if (!sessionId) {
        throw new Error('no session');
      }
      setMessages((current) => [...current, { role: 'user', text }]);
      await harness.prompt(sessionId, text);
    },
    [harness, sessionId]
  );

  const value = useMemo<HarnessContextValue>(
    () => ({
      status,
      ready: status === 'up',
      descriptor,
      url,
      retry,
      prompt,
      messages,
    }),
    [status, descriptor, url, retry, prompt, messages]
  );

  return <HarnessContext.Provider value={value}>{children}</HarnessContext.Provider>;
}

export function useHarness(): HarnessContextValue {
  const value = useContext(HarnessContext);
  if (!value) {
    throw new Error('useHarness must be used within a HarnessProvider');
  }
  return value;
}
