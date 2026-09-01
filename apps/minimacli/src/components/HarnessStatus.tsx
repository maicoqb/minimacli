import React from 'react';
import { Box, Text } from 'ink';
import { formatWorkspace } from '../lib/path';
import { useInput } from '../hooks/useInput';
import { useHarness } from '../context/HarnessContext';
import { useSession } from '../context/SessionContext';

export default function HarnessStatus() {
  const { status, descriptor, retry } = useHarness();
  const { workspace } = useSession();
  const onInput = useInput({ contexts: ['harness'], isActive: status === 'down' });

  onInput((action) => {
    if (action.type === 'harness.retry' && status === 'down') {
      retry();
    }
  });

  if (status === 'checking') {
    return <Text color="gray">connecting to harness…</Text>;
  }
  if (status === 'down') {
    return <Text color="red">x harness unreachable - press Ctrl+R to retry</Text>;
  }
  return (
    <Box width="100%" flexDirection="row" justifyContent="space-between">
      <Text color="green">● {descriptor?.provider}</Text>
      <Text color="green">{formatWorkspace(workspace)}</Text>
    </Box>
  );
}
