import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextArea from './TextArea';
import { useInput } from '../hooks/useInput';
import { useLoadingDots } from '../hooks/useLoadingDots';
import { useHarness } from '../context/HarnessContext';

const BORDER = 1;
const PADDING = 1;

export default function PromptInput() {
  const { ready, prompt, isTurnActive } = useHarness();
  const onInput = useInput();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dots = useLoadingDots(isTurnActive);

  const sendBlocked = !ready || isTurnActive;

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
    if (sendBlocked) {
      return;
    }
    if (action.type === 'submit' && value.trim() !== '') {
      handleSend(value);
    }
  });

  return (
    <Box
      flexGrow={1}
      borderStyle="round"
      borderColor={isTurnActive ? 'yellow' : 'gray'}
      border={BORDER}
      paddingLeft={PADDING}
      paddingRight={PADDING}
      flexDirection="column"
    >
      <TextArea value={value} onChange={setValue} disabled={!ready} />
      {isTurnActive ? (
        <Box paddingLeft={1}>
          <Text color="yellow">waiting{dots}</Text>
        </Box>
      ) : error ? (
        <Box paddingLeft={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : null}
    </Box>
  );
}
