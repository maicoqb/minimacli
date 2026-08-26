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
import { startEventLogging } from '../lib/eventLog';

type HarnessContextValue = {
  status: HarnessStatus;
  ready: boolean;
  descriptor: HarnessDescriptor | null;
  url: string;
  retry: () => void;
  prompt: (text: string) => Promise<void>;
};

const HarnessContext = createContext<HarnessContextValue | null>(null);

export function HarnessProvider({ url, children }: { url: string; children: ReactNode }) {
  const harness = useMemo(() => createHarness(url), [url]);
  const [status, setStatus] = useState<HarnessStatus>('checking');
  const [descriptor, setDescriptor] = useState<HarnessDescriptor | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
      (frame) => console.error('Received frame:', frame),
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
    }),
    [status, descriptor, url, retry, prompt]
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
