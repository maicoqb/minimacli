import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getHarness, type HarnessDescriptor, type HarnessStatus } from '../lib/harness';

export type { ChatMessage } from '../lib/messages';

type HarnessContextValue = {
  status: HarnessStatus;
  ready: boolean;
  descriptor: HarnessDescriptor | null;
  retry: () => void;
};

const HarnessContext = createContext<HarnessContextValue | null>(null);

export function HarnessProvider({ children }: { children: ReactNode }) {
  const harness = useMemo(() => getHarness(), []);
  const [status, setStatus] = useState<HarnessStatus>('checking');
  const [descriptor, setDescriptor] = useState<HarnessDescriptor | null>(null);

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

  const value = useMemo<HarnessContextValue>(
    () => ({
      status,
      ready: status === 'up',
      descriptor,
      retry,
    }),
    [status, descriptor, retry]
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
