import { useCallback, useEffect, useState } from 'react';
import {
  describeHarness,
  DEFAULT_HARNESS_URL,
  type HarnessDescriptor,
  type HarnessStatus,
} from '../lib/harness';

export default function useHarness(url = DEFAULT_HARNESS_URL) {
  const [status, setStatus] = useState<HarnessStatus>('checking');
  const [descriptor, setDescriptor] = useState<HarnessDescriptor | null>(null);

  const retry = useCallback(() => {
    setStatus('checking');
    describeHarness(url)
      .then((value) => {
        setDescriptor(value);
        setStatus('up');
      })
      .catch(() => {
        setStatus('down');
      });
  }, [url]);

  useEffect(() => {
    retry();
  }, [retry]);

  return { status, descriptor, retry, url };
}
