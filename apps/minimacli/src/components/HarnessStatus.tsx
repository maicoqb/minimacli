import React from 'react';
import { Box, Text, useInput } from 'ink';
import { formatWorkspace } from '../lib/path';
import { useHarness } from '../context/HarnessContext';

export default function HarnessStatus() {
  const { status, descriptor, url, retry } = useHarness();

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
