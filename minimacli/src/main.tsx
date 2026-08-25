#!/usr/bin/env node
import React from 'react';
import { render, Box, Text, useWindowSize, useInput } from 'ink';

function Greeting() {
  const { columns, rows } = useWindowSize();

  // Register an input handler so the Ink app keeps stdin in raw mode and the
  // process stays alive. Without it the process renders once and exits.
  useInput(() => {});

  return (
    <Box
      width={columns}
      height={rows}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Text color="green" bold>
        Wellcome to MinimaCLI!
      </Text>
      <Text color="gray">
        Your minimalist DSH TUI;
      </Text>
    </Box>
  );
}

render(<Greeting />);
