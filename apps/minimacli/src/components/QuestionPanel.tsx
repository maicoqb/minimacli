import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import { INPUT_CUSTOM_ANSWER, useSession, type AnswerableQuestion } from '../context/SessionContext';
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
  const questions = pendingQuestion?.questions?.filter((q) => !q.answer) || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeQuestion = questions[activeIndex];
  const options = activeQuestion?.options ?? [];
  const customAnswerIndex = options.length;
  const [selected, setSelected] = useState(0);
  const onInput = useInput({ contexts: ['question'] });

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, questions.length - 1)));
  }, [questions.length]);

  onInput((action) => {
    if (!action) {
      return;
    }
    if (action.type === 'question.previous') {
      setActiveIndex((current) => Math.max(0, current - 1));
      return;
    }
    if (action.type === 'question.next') {
      setActiveIndex((current) => Math.min(questions.length - 1, current + 1));
      return;
    }
    if (!activeQuestion) {
      return;
    }
    if (action.type === 'question.up') {
      setSelected((current) => Math.max(0, current - 1));
    } else if (action.type === 'question.down') {
      setSelected((current) => Math.min(options.length, current + 1));
    } else if (action.type === 'question.submit') {
      if (selected === customAnswerIndex) {
        respondQuestion({ id: activeQuestion.id, selected: [INPUT_CUSTOM_ANSWER] });
      } else if (options.length > 0) {
        respondQuestion({ id: activeQuestion.id, selected: [options[selected].label] });
      }
    }
  });

  if (!activeQuestion) {
    return null;
  }

  return (
    <FloatingPanel top={top} right={right} bottom={bottom} left={left}>
      <Box width="100%" flexDirection="row" justifyContent="space-between">
        <Text color="white" bold>
          {activeQuestion.header ?? ''}
        </Text>
        <Box flexDirection="row">
          <Text color="white" dimColor={activeIndex === 0}>{'<'}</Text>
          <Text color="white" dimColor={!activeQuestion.header}>
            {` ${activeIndex + 1}/${questions.length} `}
          </Text>
          <Text color="white" dimColor={activeIndex === questions.length - 1}>{'>'}</Text>
        </Box>
      </Box>
      <Text color="white" bold>
        {activeQuestion.question}
      </Text>
      {activeQuestion.detail ? (
        <Text color="white" dimColor>
          {activeQuestion.detail}
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
        <Text color={selected === customAnswerIndex ? 'black' : 'white'} backgroundColor={selected === customAnswerIndex ? 'white' : undefined}>
          {`- Custom answer...`}
        </Text>
      </Box>
    </FloatingPanel>
  );
}
