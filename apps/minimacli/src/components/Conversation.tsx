import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, measureElement, useInput, useWindowSize } from 'ink';
import Greeting from './Greeting';
import { useHarness } from '../context/HarnessContext';
import { buildLines, clamp, sliceLines } from '../lib/text';

export default function Conversation() {
  const { messages } = useHarness();
  const [height, setHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef(null);
  const { columns, rows } = useWindowSize();

  const width = Math.max(1, columns - 2);
  const messageLines = messages.map((message) => {
    const prefix = message.role === 'user' ? '$ ' : '> ';
    const content = message.text;
    return { message, prefix, content, lines: buildLines(content, Math.max(1, width - 2)) };
  });
  const totalLines = messageLines.reduce((total, item) => total + item.lines.length, 0);
  const visibleHeight = Math.max(1, height);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    setHeight(measureElement(node).height);
  }, [columns, rows, messages]);

  useEffect(() => {
    setScrollTop(Math.max(0, totalLines - visibleHeight));
  }, [messages.length, visibleHeight, totalLines]);

  useInput((_, key) => {
    if (key.pageUp) {
      setScrollTop((current) => clamp(current - visibleHeight, totalLines - visibleHeight));
    }
    if (key.pageDown) {
      setScrollTop((current) => clamp(current + visibleHeight, totalLines - visibleHeight));
    }
  });

  if (messages.length === 0) {
    return <Greeting />;
  }

  let lineOffset = 0;
  const visibleMessages = messageLines.flatMap(({ message, prefix, content, lines }) => {
    const messageStart = lineOffset;
    const messageEnd = messageStart + lines.length;
    lineOffset = messageEnd;

    const from = Math.max(0, scrollTop - messageStart);
    const to = Math.min(lines.length, scrollTop + visibleHeight - messageStart);
    if (from >= to) {
      return [];
    }

    const visibleContent = sliceLines(content, lines, from, to);

    return [
      <Box key={messageStart} flexDirection="row">
        <Text color={message.role === 'user' ? 'cyan' : 'yellow'}>
          {from === 0 ? prefix : '  '}
        </Text>
        <Box flexGrow={1}>
          <Text>{visibleContent}</Text>
        </Box>
      </Box>,
    ];
  });

  return (
    <Box ref={ref} flexGrow={1} alignSelf="stretch" flexDirection="column" overflow="hidden">
      {visibleMessages}
    </Box>
  );
}
