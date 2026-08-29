import React, { type ReactNode } from 'react';
import { Box } from 'ink';

type FloatingPanelProps = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  children: ReactNode;
};

export default function FloatingPanel({ top, right, bottom, left, children }: FloatingPanelProps) {
  return (
    <Box
      position="absolute"
      top={top}
      right={right}
      bottom={bottom}
      left={left}
      flexDirection="column"
      borderStyle="round"
      borderColor="white"
      backgroundColor="black"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={0}
      paddingBottom={0}
    >
      {children}
    </Box>
  );
}
