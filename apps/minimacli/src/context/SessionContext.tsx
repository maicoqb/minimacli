import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getConnection } from '../lib/connection';
import { parseMessageEvent } from '../lib/events';
import { updateMessages, type ChatMessage } from '../lib/messages';
import { useHarness } from './HarnessContext';

type SessionContextValue = {
  isReady: boolean;
  prompt: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  isTurnActive: boolean;
  messages: ChatMessage[];
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { url, status } = useHarness();
  const connection = getConnection(url);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTurnActive, setIsTurnActive] = useState(false);

  const isReady = status === 'up' && sessionId !== null;

  function streamEvents(sessionId: string, controller: AbortController) {
    connection.streamEvents(
      sessionId,
      (frame) => {
        if (frame.type !== 'session/event') {
          return;
        }
        const action = parseMessageEvent(frame.event);
        if (!action) {
          return;
        }
        setMessages((current) => {
          const next = updateMessages(current, action);
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
      const session = await connection.createSession(process.cwd());
      setSessionId(session.sessionId);
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
    await connection.prompt(sessionId, text);
  }

  useEffect(() => {
    if (status !== 'up' || sessionId) {
      return;
    }
    connect();
  }, [connection, status, sessionId]);

  useEffect(() => {
    if (!sessionId || status !== 'up') {
      return;
    }
    const controller = new AbortController();
    streamEvents(sessionId, controller);
    return () => controller.abort();
  }, [connection, sessionId, status]);

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
    await connection.cancel(sessionId);
  }, [connection, sessionId]);

  const value: SessionContextValue = {
    isReady,
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
