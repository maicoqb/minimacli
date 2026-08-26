import type { Key } from 'ink';
import { keyToken } from './keys';
import {
  moveLeft,
  moveRight,
  moveWordLeft,
  moveWordRight,
  moveUp,
  moveDown,
  homeAll,
  endAll,
  homeLine,
  endLine,
  insertAt,
  insertNewline,
  backspaceAt,
  deleteAt,
  deleteWordLeft,
  deleteWordRight,
  type EditorState,
} from './editor';

export type EditorAction =
  | { type: 'insertNewline' }
  | { type: 'insert'; text: string }
  | { type: 'backspace' }
  | { type: 'delete' }
  | { type: 'deleteWordLeft' }
  | { type: 'deleteWordRight' }
  | { type: 'moveLeft' }
  | { type: 'moveRight' }
  | { type: 'moveWordLeft' }
  | { type: 'moveWordRight' }
  | { type: 'moveUp' }
  | { type: 'moveDown' }
  | { type: 'homeLine' }
  | { type: 'endLine' }
  | { type: 'homeAll' }
  | { type: 'endAll' };

const keymap: Record<string, EditorAction | null> = {
  'ctrl+enter': { type: 'insertNewline' },
  'ctrl+left': { type: 'moveWordLeft' },
  'ctrl+right': { type: 'moveWordRight' },
  left: { type: 'moveLeft' },
  right: { type: 'moveRight' },
  up: { type: 'moveUp' },
  down: { type: 'moveDown' },
  'ctrl+home': { type: 'homeAll' },
  'ctrl+end': { type: 'endAll' },
  home: { type: 'homeLine' },
  end: { type: 'endLine' },
  'ctrl+backspace': { type: 'deleteWordLeft' },
  'ctrl+delete': { type: 'deleteWordRight' },
  backspace: { type: 'backspace' },
  delete: { type: 'delete' },
};

export function defaultKeyAction(input: string, key: Key): EditorAction | null {
  const mapped = keymap[keyToken(input, key)];
  if (mapped) {
    return mapped;
  }
  if (key.ctrl || input === '') {
    return null;
  }
  return { type: 'insert', text: input };
}

export function applyKeyAction(
  state: EditorState,
  wrapWidth: number,
  action: EditorAction
): EditorState {
  switch (action.type) {
    case 'moveLeft':
      return moveLeft(state);
    case 'moveRight':
      return moveRight(state);
    case 'moveWordLeft':
      return moveWordLeft(state);
    case 'moveWordRight':
      return moveWordRight(state);
    case 'moveUp':
      return moveUp(state, wrapWidth);
    case 'moveDown':
      return moveDown(state, wrapWidth);
    case 'homeLine':
      return homeLine(state, wrapWidth);
    case 'endLine':
      return endLine(state, wrapWidth);
    case 'homeAll':
      return homeAll(state);
    case 'endAll':
      return endAll(state);
    case 'insert':
      return insertAt(state, action.text);
    case 'insertNewline':
      return insertNewline(state);
    case 'backspace':
      return backspaceAt(state);
    case 'delete':
      return deleteAt(state);
    case 'deleteWordLeft':
      return deleteWordLeft(state);
    case 'deleteWordRight':
      return deleteWordRight(state);
  }
}
