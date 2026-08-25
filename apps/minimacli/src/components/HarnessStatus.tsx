import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import {
  describeHarness,
  formatWorkspace,
  DEFAULT_HARNESS_URL,
  type HarnessDescriptor,
  type HarnessStatus,
} from '../lib/harness';

export default function HarnessStatus({ url = DEFAULT_HARNESS_URL }: { url?: string }) {
  const [status, setStatus] = useState<HarnessStatus>('checking');
  const [descriptor, setDescriptor] = useState<HarnessDescriptor | null>(null);

  useEffect(() => {
    let active = true;
    describeHarness(url)
      .then((value) => {
        if (active) {
          setDescriptor(value);
          setStatus('up');
        }
      })
      .catch(() => {
        if (active) {
          setStatus('down');
        }
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (status === 'checking') {
    return <Text color="gray">connecting to harness…</Text>;
  }
  if (status === 'down') {
    return <Text color="red">✖ harness unreachable at {url}</Text>;
  }
  return (
    <Box width="100%" flexDirection="row" justifyContent="space-between">
      <Text color="green">● {descriptor?.provider}</Text>
      <Text color="green">{descriptor ? formatWorkspace(descriptor.cwd, descriptor.home) : ''}</Text>
    </Box>
  );
}
