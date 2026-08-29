import React, { useState } from 'react';
import { Box, Text, useInput as useInkInput } from 'ink';
import { useSession } from '../context/SessionContext';
import { useInput } from '../hooks/useInput';
import FloatingPanel from './FloatingPanel';

type ApprovalPanelProps = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
};

const OPTIONS = [
  { key: 'y', label: 'Allow', value: 'allow' },
  { key: 'n', label: 'Deny', value: 'deny' },
];

export default function ApprovalPanel({ top, right, bottom, left }: ApprovalPanelProps) {
  const { hasPendingApproval, respondApproval } = useSession();
  const [selected, setSelected] = useState(1);
  const onInput = useInput({ contexts: ['approval'] });

  onInput((action) => {
    if (!hasPendingApproval) {
      return;
    }
    if (action.type === 'approval.up') {
      setSelected((current) => Math.max(0, current - 1));
    } else if (action.type === 'approval.down') {
      setSelected((current) => Math.min(OPTIONS.length - 1, current + 1));
    } else if (action.type === 'approval.submit') {
      respondApproval(OPTIONS[selected].value as 'allow' | 'deny');
    }
  });

  useInkInput((input, key) => {
    if (!hasPendingApproval) {
      return;
    }
    if (key.ctrl || key.meta) {
      return;
    }
    if (input === 'y' || input === 'Y') {
      respondApproval('allow');
    } else if (input === 'n' || input === 'N') {
      respondApproval('deny');
    }
  });

  if (!hasPendingApproval) {
    return null;
  }

  return (
    <FloatingPanel top={top} right={right} bottom={bottom} left={left}>
      <Text color="white" bold>
        Approval required
      </Text>
      <Text color="white"> </Text>
      <Box flexDirection="column">
        {OPTIONS.map((option, index) => {
          const isSelected = index === selected;
          return (
            <React.Fragment key={option.key}>
              <Text color={isSelected ? 'black' : 'white'} backgroundColor={isSelected ? 'white' : undefined}>
                {`[${option.key}] ${option.label}`}
              </Text>
            </React.Fragment>
          );
        })}
      </Box>
    </FloatingPanel>
  );
}
