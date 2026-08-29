import React from 'react';
import { Box, Text } from 'ink';
import { useSession } from '../context/SessionContext';
import FloatingPanel from './FloatingPanel';

type QuestionPanelProps = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
};

export default function QuestionPanel({ top, right, bottom, left }: QuestionPanelProps) {
  const { pendingQuestion } = useSession();

  if (!pendingQuestion) {
    return null;
  }

  return (
    <FloatingPanel top={top} right={right} bottom={bottom} left={left}>
      {pendingQuestion.header ? (
        <Text color="white" dimColor>
          {pendingQuestion.header}
        </Text>
      ) : null}
      <Text color="white" bold>
        {pendingQuestion.question}
      </Text>
      {pendingQuestion.detail ? (
        <Text color="white" dimColor>
          {pendingQuestion.detail}
        </Text>
      ) : null}
      <Box flexDirection="column">
        {(pendingQuestion.options ?? []).map((option) => (
          <React.Fragment key={option.label}>
            <Text color="white">{`- ${option.label}`}</Text>
            {option.description ? (
              <Text color="white" dimColor>
                {`  ${option.description}`}
              </Text>
            ) : null}
          </React.Fragment>
        ))}
      </Box>
    </FloatingPanel>
  );
}
