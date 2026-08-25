import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export default function PromptInput() {
  const [value, setValue] = useState('');

  // Keeps stdin raw (holds the process) and collects typed characters.
  useInput((input, key) => {
    if (key.return) {
      // TODO: send the message to the server.
      setValue('');
      return;
    }
    if (key.backspace) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }
    if (key.ctrl) {
      return;
    }
    setValue((prev) => prev + input);
  });

  return (
    <Box>
      <Text>&gt; </Text>
      <Text>{value}</Text>
    </Box>
  );
}
