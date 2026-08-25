import React from 'react';
import { Box, Text } from 'ink';

export default function Greeting() {
  return (
    <Box flexDirection="column" alignItems="center">
      <Text color="green" bold>
        Welcome to MinimaCLI!
      </Text>
      <Text color="gray">Your minimalist DSH TUI;</Text>
    </Box>
  );
}
