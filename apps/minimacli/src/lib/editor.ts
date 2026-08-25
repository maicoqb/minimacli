import { buildLines, idxToPos, posToIdx, moveCodeUnit, clamp } from './text';

export type EditorState = {
  value: string;
  cursor: number;
  preferredCol?: number;
};

export type CaretPos = { row: number; col: number };

export function caretPosition(value: string, cursor: number, wrapWidth: number): CaretPos {
  return idxToPos(buildLines(value, wrapWidth), clamp(cursor, value.length));
}

export function position(state: EditorState, wrapWidth: number) {
  const lines = buildLines(state.value, wrapWidth);
  return { lines, pos: idxToPos(lines, clamp(state.cursor, state.value.length)) };
}

export function moveLeft(state: EditorState, wrapWidth: number): EditorState {
  return { ...state, cursor: moveCodeUnit(state.value, state.cursor, -1) };
}

export function moveRight(state: EditorState, wrapWidth: number): EditorState {
  return { ...state, cursor: moveCodeUnit(state.value, state.cursor, 1) };
}

export function moveUp(state: EditorState, wrapWidth: number): EditorState {
  const { lines, pos } = position(state, wrapWidth);
  if (pos.row <= 0) {
    return state;
  }
  const col = state.preferredCol ?? pos.col;
  return {
    ...state,
    preferredCol: col,
    cursor: posToIdx(lines, pos.row - 1, col),
  };
}

export function moveDown(state: EditorState, wrapWidth: number): EditorState {
  const { lines, pos } = position(state, wrapWidth);
  if (pos.row >= lines.length - 1) {
    return state;
  }
  const col = state.preferredCol ?? pos.col;
  return {
    ...state,
    preferredCol: col,
    cursor: posToIdx(lines, pos.row + 1, col),
  };
}

export function homeAll(state: EditorState): EditorState {
  return { ...state, cursor: 0 };
}

export function endAll(state: EditorState): EditorState {
  return { ...state, cursor: state.value.length, preferredCol: undefined };
}

export function homeLine(state: EditorState, wrapWidth: number): EditorState {
  const { lines, pos } = position(state, wrapWidth);
  return { ...state, cursor: lines[pos.row]?.start ?? 0, preferredCol: undefined };
}

export function endLine(state: EditorState, wrapWidth: number): EditorState {
  const { lines, pos } = position(state, wrapWidth);
  const line = lines[pos.row];
  return {
    ...state,
    cursor: line ? line.start + line.widths.length : state.value.length,
    preferredCol: undefined,
  };
}

export function insertAt(state: EditorState, text: string): EditorState {
  const at = clamp(state.cursor, state.value.length);
  return { ...state, cursor: at + text.length, value: state.value.slice(0, at) + text + state.value.slice(at) };
}

export function insertNewline(state: EditorState): EditorState {
  const at = clamp(state.cursor, state.value.length);
  return { ...state, cursor: at + 1, value: state.value.slice(0, at) + '\n' + state.value.slice(at) };
}

export function backspaceAt(state: EditorState): EditorState {
  const at = clamp(state.cursor, state.value.length);
  if (at <= 0) {
    return state;
  }
  const before = moveCodeUnit(state.value, at, -1);
  return { ...state, cursor: before, value: state.value.slice(0, before) + state.value.slice(at) };
}

export function deleteAt(state: EditorState): EditorState {
  const at = clamp(state.cursor, state.value.length);
  if (at >= state.value.length) {
    return state;
  }
  const after = moveCodeUnit(state.value, at, 1);
  return { ...state, value: state.value.slice(0, at) + state.value.slice(after) };
}
