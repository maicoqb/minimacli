import React, { useEffect, useRef, useState } from 'react';
import { Box, measureElement, useWindowSize } from 'ink';
import { useInput } from '../hooks/useInput';
import { clamp } from '../lib/text';

type ScrollableProps<T> = {
  lines: T[];
  width: number;
  renderLine: (line: T) => React.ReactNode;
};

export default function Scrollable<T>({ lines, width, renderLine }: ScrollableProps<T>) {
  const viewportRef = useRef(null);
  const [height, setHeight] = useState(0);
  const { columns, rows } = useWindowSize();
  const [scrollTop, setScrollTop] = useState(0);

  const totalLines = lines.length;
  const visibleHeight = Math.max(1, height);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }
    setHeight(measureElement(node).height);
  }, [columns, rows, lines]);

  useEffect(() => {
    setScrollTop(Math.max(0, totalLines - visibleHeight));
  }, [totalLines, visibleHeight]);

  const onInput = useInput();
  onInput((action) => {
    if (action.type === 'scrollPageUp') {
      setScrollTop((current) => clamp(current - visibleHeight));
    }
    if (action.type === 'scrollPageDown') {
      setScrollTop((current) => clamp(current + visibleHeight, totalLines - visibleHeight));
    }
    if (action.type === 'scrollUp') {
      setScrollTop((current) => clamp(current - 1, totalLines - visibleHeight));
    }
    if (action.type === 'scrollDown') {
      setScrollTop((current) => clamp(current + 1, totalLines - visibleHeight));
    }
  });

  const visibleLines = lines.slice(scrollTop, scrollTop + visibleHeight);

  return (
    <Box
      ref={viewportRef}
      width={width}
      flexGrow={1}
      alignSelf="stretch"
      flexDirection="column"
      overflow="hidden"
    >
      {visibleLines.map((line, index) => (
        <React.Fragment key={index}>{renderLine(line)}</React.Fragment>
      ))}
    </Box>
  );
}
