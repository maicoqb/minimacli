import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useInput, useCursor, useWindowSize, measureElement } from 'ink';

export default function PromptInput() {
  const [value, setValue] = useState('');
  const [boxPos, setBoxPos] = useState({ x: 0, y: 0 });
  const boxRef = useRef(null);
  const { setCursorPosition } = useCursor();
  const { columns, rows } = useWindowSize();

  // Measure the input box position (relative to the Ink output) whenever
  // value changes or the terminal resizes. measureElement must run after
  // layout (effect phase), so we stash the box position in state and compute
  // the caret position during the following render.
  useEffect(() => {
    const node = boxRef.current;
    if (!node) {
      return;
    }
    setBoxPos(measureElement(node));
  }, [value, columns, rows]);

  // Keeps stdin raw (holds the process) and collects typed characters.
  useInput((input, key) => {
    if (key.return) {
      // TODO: send the message to the server.
      setValue('');
      return;
    }
    if (key.backspace) {
      setValue((prev) => prev.slice(0, -1));
      return;
    }
    if (key.ctrl) {
      return;
    }
    setValue((prev) => prev + input);
  });

  // Render the caret at the end of the typed text, inside the input border.
  // Offsets: 1 (border) + 1 (paddingLeft) for the text start, +2 for "> ".
  setCursorPosition({
    x: boxPos.x + 1 + 1 + 2 + value.length,
    y: boxPos.y + 1, // border
  });

  return (
    <Box
      ref={boxRef}
      flexGrow={1}
      borderStyle="round"
      borderColor="gray"
      paddingLeft={1}
      paddingRight={1}
    >
      <Text>&gt; </Text>
      <Text>{value}</Text>
    </Box>
  );
}
