import type { Key } from 'ink';
import { keyToken } from './keys';

export type CommandAction =
  | { type: 'retry' }
  | { type: 'submit' }
  | { type: 'cancel' }
  | { type: 'scrollPageUp' }
  | { type: 'scrollPageDown' }
  | { type: 'scrollUp' }
  | { type: 'scrollDown' }
  | { type: 'up' }
  | { type: 'down' };

export const keymap: Record<string, CommandAction | null> = {
  'ctrl+r': { type: 'retry' },
  enter: { type: 'submit' },
  'ctrl+c': { type: 'cancel' },
  pageup: { type: 'scrollPageUp' },
  pagedown: { type: 'scrollPageDown' },
  'ctrl+up': { type: 'scrollUp' },
  'ctrl+down': { type: 'scrollDown' },
  up: { type: 'up' },
  down: { type: 'down' },
};

export function resolveKey(input: string, key: Key): CommandAction | null {
  return keymap[keyToken(input, key)] ?? null;
}
