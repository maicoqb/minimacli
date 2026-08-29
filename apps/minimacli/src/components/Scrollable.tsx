import React, { useEffect, useRef, useState } from 'react';
import { Box, measureElement, useWindowSize } from 'ink';
import { useInput } from '../hooks/useInput';
import { clamp } from '../lib/text';

type ScrollableProps<T> = {
  lines: T[];
  width: number;
  renderLine: (line: T) => React.ReactNode;
  focusIndex?: number;
};

export default function Scrollable<T>({ lines, width, renderLine, focusIndex }: ScrollableProps<T>) {
  const viewportRef = useRef(null);
  const [height, setHeight] = useState(0);
  const { columns, rows } = useWindowSize();
  const [scrollTop, setScrollTop] = useState(0);

  const totalLines = lines.length;
  const visibleHeight = Math.max(1, height);
  const maxScroll = focusIndex ?? Math.max(0, totalLines - visibleHeight);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) {
      return;
    }
    setHeight(measureElement(node).height);
  }, [columns, rows, lines]);

  useEffect(() => {
    setScrollTop(focusIndex ?? Math.max(0, totalLines - visibleHeight));
  }, [focusIndex, lines, totalLines, visibleHeight]);

  const onInput = useInput({ contexts: ['scroll'] });
  onInput((action) => {
    if (action.type === 'scroll.pageUp') {
      setScrollTop((current) => clamp(current - visibleHeight));
    }
    if (action.type === 'scroll.pageDown') {
      setScrollTop((current) => clamp(current + visibleHeight, maxScroll));
    }
    if (action.type === 'scroll.up') {
      setScrollTop((current) => clamp(current - 1, maxScroll));
    }
    if (action.type === 'scroll.down') {
      setScrollTop((current) => clamp(current + 1, maxScroll));
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
