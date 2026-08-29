import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useSession } from '../context/SessionContext';
import { useInput } from '../hooks/useInput';
import FloatingPanel from './FloatingPanel';

type QuestionPanelProps = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
};

export default function QuestionPanel({ top, right, bottom, left }: QuestionPanelProps) {
  const { pendingQuestion, respondQuestion } = useSession();
  const question = pendingQuestion?.questions[0];
  const options = question?.options ?? [];
  const [selected, setSelected] = useState(0);
  const onInput = useInput();

  onInput((action) => {
    if (!question) {
      return;
    }
    if (action.type === 'up') {
      setSelected((current) => Math.max(0, current - 1));
    } else if (action.type === 'down') {
      setSelected((current) => Math.min(options.length - 1, current + 1));
    } else if (action.type === 'submit' && options.length > 0) {
      respondQuestion({ answers: [{ id: question.id, selected: [options[selected].label] }] });
    }
  });

  if (!question) {
    return null;
  }

  return (
    <FloatingPanel top={top} right={right} bottom={bottom} left={left}>
      {question.header ? (
        <Text color="white" dimColor>
          {question.header}
        </Text>
      ) : null}
      <Text color="white" bold>
        {question.question}
      </Text>
      {question.detail ? (
        <Text color="white" dimColor>
          {question.detail}
        </Text>
      ) : null}
      <Box flexDirection="column">
        {options.map((option, index) => {
          const isSelected = index === selected;
          return (
            <React.Fragment key={option.label}>
              <Text color={isSelected ? 'black' : 'white'} backgroundColor={isSelected ? 'white' : undefined}>
                {`- ${option.label}`}
              </Text>
              {option.description ? (
                <Text color="white" dimColor>
                  {`  ${option.description}`}
                </Text>
              ) : null}
            </React.Fragment>
          );
        })}
      </Box>
    </FloatingPanel>
  );
}
