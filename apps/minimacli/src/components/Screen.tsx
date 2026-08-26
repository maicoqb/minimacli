import React from 'react';
import { Box, useWindowSize } from 'ink';
import Conversation from './Conversation';
import PromptInput from './PromptInput';
import HarnessStatus from './HarnessStatus';
import Hr from './Hr';

const SCREEN_PADDING = 1;
const SEPARATOR_HEIGHT = 1;
const STATUS_HEIGHT = 1;

export default function Screen() {
  const { columns, rows } = useWindowSize();

  const inputHeight = Math.max(4, Math.ceil(rows * 0.2));
  const outputHeight =
    rows - inputHeight - SEPARATOR_HEIGHT - STATUS_HEIGHT - 2 * SCREEN_PADDING;
  const separatorWidth = Math.max(0, columns - 2 * SCREEN_PADDING);

  return (
    <Box
      width={columns}
      height={rows}
      flexDirection="column"
      padding={SCREEN_PADDING}
    >
      <Box
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        height={outputHeight}
      >
        <Conversation />
      </Box>

      <Hr width={separatorWidth} />

      <Box width="100%" justifyContent="flex-start" paddingLeft={3} paddingRight={3}>
        <HarnessStatus />
      </Box>

      <Box
        justifyContent="flex-start"
        height={inputHeight}
        paddingLeft={3}
        paddingRight={3}
      >
        <PromptInput />
      </Box>
    </Box>
  );
}
