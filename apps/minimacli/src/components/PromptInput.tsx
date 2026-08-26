import React, { useState } from 'react';
import { Box, type Key } from 'ink';
import TextArea from './TextArea';
import { type TextAreaKeyAction } from '../lib/input';

const BORDER = 1;
const PADDING = 1;

export default function PromptInput({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState('');

  function onKey(_: string, key: Key): boolean | TextAreaKeyAction {
    if (key.return) {
      // TODO submit
      setValue('');
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
    >
      <TextArea value={value} onChange={setValue} onKey={onKey} disabled={disabled} />
    </Box>
  );
}
