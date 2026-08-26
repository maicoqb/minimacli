import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextArea from './TextArea';
import { useInput } from '../hooks/useInput';
import { useHarness } from '../context/HarnessContext';

const BORDER = 1;
const PADDING = 1;

export default function PromptInput() {
  const { ready, prompt } = useHarness();
  const onInput = useInput();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSend(text: string) {
    setError(null);
    try {
      await prompt(text);
      setValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'send failed');
    }
  }

  onInput((action) => {
    if (action.type === 'submit' && value.trim() !== '') {
      handleSend(value);
    }
  });

  return (
    <Box
      flexGrow={1}
      borderStyle="round"
      borderColor="gray"
      border={BORDER}
      paddingLeft={PADDING}
      paddingRight={PADDING}
      flexDirection="column"
    >
      <TextArea value={value} onChange={setValue} disabled={!ready} />
      {error ? (
        <Box paddingLeft={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
    </Box>
  );
}
