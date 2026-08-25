import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useInput, useCursor, useWindowSize, measureElement, type Key } from 'ink';
import { caretPosition } from '../lib/editor';
import { applyKeyAction, defaultKeyAction, type TextAreaKeyAction } from '../lib/input';

type TextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  onKey?: (input: string, key: Key) => boolean | TextAreaKeyAction;
};

export default function TextArea({ value, onChange, onKey }: TextAreaProps) {
  const [cursor, setCursor] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const { setCursorPosition } = useCursor();
  const { columns, rows } = useWindowSize();

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const { x, y, width } = measureElement(node);
    setPos({ x, y });
    setWidth(width);
  }, [columns, rows, value]);

  const wrapWidth = Math.max(1, width);
  const clampCursor = Math.max(0, Math.min(cursor, value.length));
  const caret = caretPosition(value, clampCursor, wrapWidth);

  setCursorPosition({
    x: pos.x + caret.col,
    y: pos.y + caret.row,
  });

  function handle(state: { value: string; cursor: number }, action: TextAreaKeyAction) {
    const next = applyKeyAction(state, wrapWidth, action);
    setCursor(next.cursor);
    onChange(next.value);
  }

  useInput((input, key) => {
    const result = onKey ? onKey(input, key) : true;
    if (result === false) {
      return;
    }
    const action = result === true ? defaultKeyAction(input, key) : result;
    if (!action) {
      return;
    }
    handle({ value, cursor }, action);
  });

  return (
    <Box ref={ref} width="100%">
      <Text>{value}</Text>
    </Box>
  );
}
