import React, { useMemo } from 'react';
import { Box, Text, useWindowSize } from 'ink';
import Greeting from './Greeting';
import Hr from './Hr';
import Scrollable from './Scrollable';
import { useSession } from '../context/SessionContext';
import { buildLines, sliceLines } from '../lib/text';
import type { ChatMessageRole } from '../lib/messages';

type DisplayLine =
  | { kind: 'text' | 'approval'; text: string; role: ChatMessageRole; hasPrefix: boolean }
  | { kind: 'separator' };

export default function Conversation() {
  const { messages } = useSession();
  const { columns } = useWindowSize();
  const width = Math.max(1, columns - 2);
  const PREFIX_WIDTH = 2;

  const { lines, focusIndex } = useMemo(() => {
    const result: DisplayLine[] = [];
    let approvalStartIndex: number | undefined;
    const hasActiveApproval = messages[messages.length - 1]?.kind === 'approval';

    for (const message of messages) {
      if (message.role === 'user') {
        result.push({ kind: 'separator' });
      }
      const built = buildLines(message.text, Math.max(1, width - PREFIX_WIDTH));
      const kind = message.kind === 'approval' ? 'approval' : 'text';
      for (let i = 0; i < built.length; i++) {
        result.push({
          kind,
          text: sliceLines(message.text, built, i, i + 1).replace(/\n$/, ''),
          role: message.role,
          hasPrefix: i === 0,
        });
        if (hasActiveApproval && kind === 'approval' && i === 0) {
          approvalStartIndex = result.length - 1;
        }
      }
    }

    return { lines: result, focusIndex: approvalStartIndex };
  }, [messages, width]);

  if (messages.length === 0) {
    return <Greeting />;
  }

  function renderLine(line: DisplayLine) {
    if (line.kind === 'separator') {
      return <Hr width={width} />;
    }
    const isUser = line.role === 'user';
    const prefix = isUser ? '$ ' : '> ';
    return (
      <Box width={width} flexDirection="row">
        <Text color={line.kind === 'approval' ? 'magenta' : isUser ? 'cyan' : 'yellow'}>
          {line.hasPrefix ? prefix : '  '}
        </Text>
        <Box flexGrow={1}>
          <Text>{line.text}</Text>
        </Box>
      </Box>
    );
  }

  return <Scrollable lines={lines} width={width} renderLine={renderLine} focusIndex={focusIndex} />;
}
