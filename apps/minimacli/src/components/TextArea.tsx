import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useInput, useCursor, useWindowSize, measureElement } from 'ink';
import { buildLines, sliceLines, idxToPos, clamp } from '../lib/text';
import { applyKeyAction, defaultKeyAction, type EditorAction } from '../lib/editorInput';

type TextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function TextArea({ value, onChange, disabled = false, placeholder }: TextAreaProps) {
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

  function handle(state: { value: string; cursor: number }, action: EditorAction) {
    const next = applyKeyAction(state, wrapWidth, action);
    setCursor(next.cursor);
    onChange(next.value);
  }

  useInput(
    (input, key) => {
      const action = defaultKeyAction(input, key);
      if (!action) {
        return;
      }
      handle({ value, cursor }, action);
    },
    { isActive: !disabled }
  );

  const visibleLines = lines
    .slice(scrollTop, scrollTop + visibleHeight)
    .map((_, index) => {
      const lineIndex = scrollTop + index;
      return sliceLines(value, lines, lineIndex, lineIndex + 1).replace(/\n$/, '');
    });

  return (
    <Box ref={ref} width="100%" flexGrow={1}>
      <Box height={visibleHeight} overflow="hidden" flexDirection="column">
        {value === '' && placeholder ? (
          <Text dimColor>{placeholder}</Text>
        ) : (
          visibleLines.map((line, index) => (
            <React.Fragment key={scrollTop + index}>
              <Text>{line || ' '}</Text>
            </React.Fragment>
          ))
        )}
      </Box>
    </Box>
  );
}
