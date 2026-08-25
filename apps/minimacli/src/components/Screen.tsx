import React from 'react';
import { Box, Text, useWindowSize } from 'ink';
import Greeting from './Greeting';
import PromptInput from './PromptInput';

const SCREEN_PADDING = 1;

export default function Screen() {
  const { columns, rows } = useWindowSize();

  const inputHeight = Math.max(4, Math.ceil(rows * 0.2));
  const separatorWidth = Math.max(0, columns - 2 * SCREEN_PADDING);

  return (
    <Box
      width={columns}
      height={rows}
      flexDirection="column"
      padding={SCREEN_PADDING}
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
