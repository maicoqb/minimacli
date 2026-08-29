import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextArea from './TextArea';
import { useInput } from '../hooks/useInput';
import { useLoadingDots } from '../hooks/useLoadingDots';
import { useCtrlCHandler } from '../hooks/useCtrlCHandler';
import { useSession } from '../context/SessionContext';

const BORDER = 1;
const PADDING = 1;

export default function PromptInput() {
  const {
    isReady,
    prompt,
    respondQuestion,
    isTurnActive,
    hasPendingApproval,
    pendingQuestion,
  } = useSession();
  const onInput = useInput();
  const exitPending = useCtrlCHandler();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dots = useLoadingDots(isTurnActive);

  const question = pendingQuestion?.questions[0];
  const hasQuestion = question != null;
  const isCustomAnswer = pendingQuestion?.customAnswer === true;
  const isDisabled = !isReady || hasPendingApproval || (hasQuestion && !isCustomAnswer);
  const sendBlocked = isDisabled || isTurnActive;
  const placeholder = hasQuestion && isCustomAnswer ? 'Type your custom answer' : 'Type a message...';

  async function handleSend(text: string) {
    setError(null);
    try {
      if (hasQuestion && isCustomAnswer) {
        await respondQuestion({ answers: [{ id: question.id, selected: [], custom: text }] });
      } else {
        await prompt(text);
      }
      setValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'send failed');
    }
  }

  onInput((action) => {
    if (action.type === 'escape') {
      setValue('');
      if (hasQuestion && isCustomAnswer) {
        respondQuestion({ answers: [] });
        return;
      }
      return;
    }
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
      <TextArea
        value={value}
        onChange={setValue}
        disabled={isDisabled}
        placeholder={placeholder}
      />
      {hasQuestion && isCustomAnswer ? (
        <Box paddingLeft={1}>
          <Text color="gray">press Esc to back to options</Text>
        </Box>
      ) : value !== '' ? (
        <Box paddingLeft={1}>
          <Text color="gray">press Esc to clear</Text>
        </Box>
      ) : exitPending ? (
        <Box paddingLeft={1}>
          <Text color="yellow">press Ctrl+C again to exit</Text>
        </Box>
      ) : isTurnActive ? (
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
