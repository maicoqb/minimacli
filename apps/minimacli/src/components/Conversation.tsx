import React from 'react';
import { Box, Text } from 'ink';
import Greeting from './Greeting';
import { useHarness } from '../context/HarnessContext';

export default function Conversation() {
  const { messages } = useHarness();

  if (messages.length === 0) {
    return <Greeting />;
  }

  return (
    <Box flexGrow={1} alignSelf="stretch" flexDirection="column" justifyContent="flex-start">
      {messages.map((msg, i) => (
        <Box key={i} paddingLeft={1} paddingRight={1}>
          {msg.role === 'user' ? (
            <Text>
              <Text color="cyan">$ </Text>
              {msg.text}
            </Text>
          ) : (
            <Text>
              <Text color="yellow">{'> '}</Text>
              {msg.text}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
}
