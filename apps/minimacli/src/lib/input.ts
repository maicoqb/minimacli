import type { Key } from 'ink';
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

export type TextAreaKeyAction =
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

export function defaultKeyAction(input: string, key: Key): TextAreaKeyAction | null {
  if (key.return) {
    return key.ctrl ? { type: 'insertNewline' } : null;
  }
  if (key.ctrl && key.leftArrow) {
    return { type: 'moveWordLeft' };
  }
  if (key.ctrl && key.rightArrow) {
    return { type: 'moveWordRight' };
  }
  if (key.leftArrow) {
    return { type: 'moveLeft' };
  }
  if (key.rightArrow) {
    return { type: 'moveRight' };
  }
  if (key.upArrow) {
    return { type: 'moveUp' };
  }
  if (key.downArrow) {
    return { type: 'moveDown' };
  }
  if (key.home || key.end) {
    return key.ctrl
      ? key.home
        ? { type: 'homeAll' }
        : { type: 'endAll' }
      : key.home
        ? { type: 'homeLine' }
        : { type: 'endLine' };
  }
  if (key.ctrl && key.backspace) {
    return { type: 'deleteWordLeft' };
  }
  if (key.ctrl && key.delete) {
    return { type: 'deleteWordRight' };
  }
  if (key.backspace) {
    return { type: 'backspace' };
  }
  if (key.delete) {
    return { type: 'delete' };
  }
  if (key.ctrl) {
    return null;
  }
  return { type: 'insert', text: input };
}

export function applyKeyAction(
  state: EditorState,
  wrapWidth: number,
  action: TextAreaKeyAction
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
