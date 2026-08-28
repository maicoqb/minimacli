import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getHarness, type SessionEvent } from '../lib/harness';
import { updateMessages, type ChatMessage } from '../lib/messages';
import { useHarness } from './HarnessContext';

type SessionContextValue = {
  isReady: boolean;
  workspace: string;
  prompt: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  isTurnActive: boolean;
  messages: ChatMessage[];
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { url, status } = useHarness();
  const harness = useMemo(() => getHarness(url), [url]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState(process.cwd());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTurnActive, setIsTurnActive] = useState(false);

  const isReady = status === 'up' && sessionId !== null;

  function streamEvents(sessionId: string, controller: AbortController) {
    harness.streamEvents(
      sessionId,
      (event: SessionEvent) => {
        
        setMessages((current) => {
          const next = updateMessages(current, event);
          const last = next[next.length - 1];
          setIsTurnActive(last?.streaming ?? false);
          return next;
        });
      },
      controller.signal
    );
  }

  async function connect() {
    try {
      const cwd = process.cwd();
      const session = await harness.createSession(cwd);
      setSessionId(session.sessionId);
      setWorkspace(cwd);
    } catch {
      return;
    }
  }

  async function sendPrompt(sessionId: string, text: string) {
    setMessages((current) => [
      ...current,
      { role: 'user', text, streaming: false },
    ]);
    setIsTurnActive(true);
    await harness.prompt(sessionId, text);
  }

  useEffect(() => {
    if (status !== 'up' || sessionId) {
      return;
    }
    connect();
  }, [harness, status, sessionId]);

  useEffect(() => {
    if (!sessionId || status !== 'up') {
      return;
    }
    const controller = new AbortController();
    streamEvents(sessionId, controller);
    return () => controller.abort();
  }, [harness, sessionId, status]);

  const prompt = useCallback(
    async (text: string) => {
      if (!sessionId) {
        throw new Error('no session');
      }
      await sendPrompt(sessionId, text);
    },
    [sessionId]
  );

  const interrupt = useCallback(async () => {
    if (!sessionId) {
      return;
    }
    await harness.cancel(sessionId);
  }, [harness, sessionId]);

  const value: SessionContextValue = {
    isReady,
workspace,
    prompt,
    interrupt,
    isTurnActive,
    messages,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return value;
}
