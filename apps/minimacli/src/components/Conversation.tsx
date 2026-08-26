import React, { useMemo } from 'react';
import { Box, Text, useWindowSize } from 'ink';
import Greeting from './Greeting';
import Hr from './Hr';
import Scrollable from './Scrollable';
import { useSession } from '../context/SessionContext';
import { buildDisplayLines, type DisplayLine } from '../lib/conversation';

export default function Conversation() {
  const { messages } = useSession();
  const { columns } = useWindowSize();
  const width = Math.max(1, columns - 2);

  const { lines, focusIndex } = useMemo(
    () => buildDisplayLines(messages, width),
    [messages, width]
  );

  if (messages.length === 0) {
    return <Greeting />;
  }

  function renderLine(line: DisplayLine) {
    if (line.kind === 'separator') {
      return <Hr width={width} />;
    }

    if (line.kind === 'approval-tool') {
      return (
        <Box width={width} flexDirection="row">
          <Text color="magenta">{'> '}</Text>
          <Box flexGrow={1}>
            <Text color="magenta">tool: {line.tool}</Text>
          </Box>
        </Box>
      );
    }

    if (line.kind === 'tool') {
      return (
        <Text backgroundColor="blue" bold>
          {`> ${line.name}(${JSON.stringify(line.arguments)})`}
        </Text>
      );
    }

    const isUser = line.role === 'user';
    const prefix = isUser ? '$ ' : '> ';
    return (
      <Box width={width} flexDirection="row">
        <Text color={isUser ? 'cyan' : 'yellow'}>
          {line.first ? prefix : '  '}
        </Text>
        <Box flexGrow={1}>
          <Text>{line.text}</Text>
        </Box>
      </Box>
    );
  }

  return <Scrollable lines={lines} width={width} renderLine={renderLine} focusIndex={focusIndex} />;
}
