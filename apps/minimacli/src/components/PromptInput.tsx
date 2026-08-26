import React, { useState } from 'react';
import { Box, Text, type Key } from 'ink';
import TextArea from './TextArea';
import { useHarness } from '../context/HarnessContext';
import { type TextAreaKeyAction } from '../lib/input';

const BORDER = 1;
const PADDING = 1;

export default function PromptInput() {
  const { ready, prompt } = useHarness();
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

  function onKey(_: string, key: Key): boolean | TextAreaKeyAction {
    if (key.return) {
      if (value.trim() === '') {
        return false;
      }
      handleSend(value);
      return false;
    }
    return true;
  }

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
      <TextArea value={value} onChange={setValue} onKey={onKey} disabled={!ready} />
      {error ? (
        <Box paddingLeft={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
    </Box>
  );
}
