import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getHarness, type ApprovalRequest, type SessionEvent } from '../lib/harness';
import { updateMessages, type ChatMessage } from '../lib/messages';
import { useHarness } from './HarnessContext';

type SessionContextValue = {
  isReady: boolean;
  workspace: string;
  prompt: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  isTurnActive: boolean;
  hasPendingApproval: boolean;
  respondApproval: (kind: 'allow' | 'deny') => Promise<void>;
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
  const [pendingApproval, setPendingApproval] = useState<ApprovalRequest | null>(null);

  const isReady = status === 'up' && sessionId !== null;
  const hasPendingApproval = pendingApproval !== null;

  function streamEvents(sessionId: string, controller: AbortController) {
    harness.streamEvents(
      sessionId,
      (event: SessionEvent) => {
        if (event.kind === 'approval-requested') {
          setPendingApproval(event);
        }
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

  const respondApproval = useCallback(
    async (kind: 'allow' | 'deny') => {
      if (!pendingApproval) {
        throw new Error('no pending approval');
      }
      setPendingApproval(null);
      await harness.respondApproval(pendingApproval, kind);
    },
    [harness, pendingApproval]
  );

  const value: SessionContextValue = {
    isReady,
    workspace,
    prompt,
    interrupt,
    isTurnActive,
    hasPendingApproval,
    respondApproval,
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
