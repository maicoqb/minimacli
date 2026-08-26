import React, { useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { formatWorkspace, type HarnessStatus } from '../lib/harness';
import useHarness from '../hooks/useHarness';

type Props = {
  onReady: (ready: boolean) => void;
};

export default function HarnessStatus({ onReady }: Props) {
  const { status, descriptor, url, retry } = useHarness();

  useEffect(() => {
    onReady(status === 'up');
  }, [status, onReady]);

  useInput(
    (input) => {
      if (input === 'r') {
        retry();
      }
    },
    { isActive: status === 'down' }
  );

  if (status === 'checking') {
    return <Text color="gray">connecting to harness…</Text>;
  }
  if (status === 'down') {
    return <Text color="red">x harness unreachable at {url} - press r to retry</Text>;
  }
  return (
    <Box width="100%" flexDirection="row" justifyContent="space-between">
      <Text color="green">● {descriptor?.provider}</Text>
      <Text color="green">{descriptor ? formatWorkspace(descriptor.cwd, descriptor.home) : ''}</Text>
    </Box>
  );
}
