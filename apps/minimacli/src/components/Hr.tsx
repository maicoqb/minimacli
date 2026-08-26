import React from 'react';
import { Text } from 'ink';

type HrProps = {
  width?: number;
  char?: string;
};

const Hr: React.FC<HrProps> = ({ width, char = '─' }) => {
  const w = Math.max(0, width ?? 0);
  return <Text>{char.repeat(w)}</Text>;
};

export default Hr;
