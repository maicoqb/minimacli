import React from 'react';
import { Box, Text } from 'ink';
import { formatWorkspace } from '../lib/path';
import { useInput } from '../hooks/useInput';
import { useHarness } from '../context/HarnessContext';

export default function HarnessStatus() {
  const { status, descriptor, url, retry } = useHarness();
  const onInput = useInput({ isActive: status === 'down' });

  onInput((action) => {
    if (action.type === 'retry' && status === 'down') {
      retry();
    }
  });

  if (status === 'checking') {
    return <Text color="gray">connecting to harness…</Text>;
  }
  if (status === 'down') {
    return <Text color="red">x harness unreachable at {url} - press Ctrl+R to retry</Text>;
  }
  return (
    <Box width="100%" flexDirection="row" justifyContent="space-between">
      <Text color="green">● {descriptor?.provider}</Text>
      <Text color="green">{descriptor ? formatWorkspace(descriptor.cwd, descriptor.home) : ''}</Text>
    </Box>
  );
}
