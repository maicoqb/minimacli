import React from 'react';
import { Box, Text, useWindowSize } from 'ink';
import Greeting from './Greeting';
import PromptInput from './PromptInput';

export default function Screen() {
  const { columns, rows } = useWindowSize();

  const inputHeight = Math.max(4, Math.ceil(rows * 0.20));
  const separatorWidth = Math.max(0, columns - 2); // inside screen padding={1}

  return (
    <Box
      width={columns}
      height={rows}
      flexDirection="column"
      padding={1}
    >
      <Box flexGrow={1} alignItems="center" justifyContent="center">
        <Greeting />
      </Box>

      <Text>{"─".repeat(separatorWidth)}</Text>

      <Box
        justifyContent="flex-start"
        height={inputHeight}
        paddingTop={1}
        paddingLeft={3}
        paddingRight={3}
      >
        <PromptInput />
      </Box>
    </Box>
  );
}
