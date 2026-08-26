import type { Key } from 'ink';
import { keyToken } from './keys';

export type CommandAction =
  | { type: 'retry' }
  | { type: 'submit' }
  | { type: 'scrollUp' }
  | { type: 'scrollDown' };

export const keymap: Record<string, CommandAction | null> = {
  'ctrl+r': { type: 'retry' },
  enter: { type: 'submit' },
  pageup: { type: 'scrollUp' },
  pagedown: { type: 'scrollDown' },
};

export function resolveKey(input: string, key: Key): CommandAction | null {
  return keymap[keyToken(input, key)] ?? null;
}
