import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useInput, useCursor, useWindowSize, measureElement, type Key } from 'ink';
import { buildLines, sliceLines, idxToPos, clamp } from '../lib/text';
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
  const [height, setHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef(null);
  const { setCursorPosition } = useCursor();
  const { columns, rows } = useWindowSize();

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const { x, y, width, height } = measureElement(node);
    setPos({ x, y });
    setWidth(width);
    setHeight(height);
  }, [columns, rows, value]);

  const wrapWidth = Math.max(1, width);
  const visibleHeight = Math.max(1, height);
  const lines = buildLines(value, wrapWidth);
  const caret = idxToPos(lines, clamp(cursor, value.length));

  useEffect(() => {
    setScrollTop((current) => {
      const maxScroll = Math.max(0, lines.length - visibleHeight);
      if (current > maxScroll) {
        return maxScroll;
      }
      if (caret.row < current) {
        return caret.row;
      }
      if (caret.row >= current + visibleHeight) {
        return caret.row - visibleHeight + 1;
      }
      return current;
    });
  }, [caret.row, visibleHeight, lines.length]);

  setCursorPosition({
    x: pos.x + caret.col,
    y: pos.y + Math.max(0, caret.row - scrollTop),
  });

  function handle(state: { value: string; cursor: number }, action: TextAreaKeyAction) {
    const next = applyKeyAction(state, wrapWidth, action);
    setCursor(next.cursor);
    onChange(next.value);
  }

  function scrollBy(delta: number) {
    setScrollTop((current) => {
      const maxScroll = Math.max(0, lines.length - visibleHeight);
      return clamp(current + delta, maxScroll);
    });
  }

  useInput((input, key) => {
    if (key.pageUp) {
      scrollBy(-visibleHeight);
      return;
    }
    if (key.pageDown) {
      scrollBy(visibleHeight);
      return;
    }
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

  const visible = sliceLines(value, lines, scrollTop, scrollTop + visibleHeight);

  return (
    <Box ref={ref} width="100%" flexGrow={1}>
      <Box height={visibleHeight} overflow="hidden">
        <Text>{visible}</Text>
      </Box>
    </Box>
  );
}
