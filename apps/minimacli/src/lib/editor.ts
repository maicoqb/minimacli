import { buildLines, idxToPos, posToIdx, moveCodeUnit, clamp } from './text';

export type EditorState = {
  value: string;
  cursor: number;
  preferredCol?: number;
};

export function position(state: EditorState, wrapWidth: number) {
  const lines = buildLines(state.value, wrapWidth);
  return { lines, pos: idxToPos(lines, clamp(state.cursor, state.value.length)) };
}

export function moveLeft(state: EditorState): EditorState {
  return { ...state, cursor: moveCodeUnit(state.value, state.cursor, -1), preferredCol: undefined };
}

export function moveRight(state: EditorState): EditorState {
  return { ...state, cursor: moveCodeUnit(state.value, state.cursor, 1), preferredCol: undefined };
}

const WORD_RE = /^\w/u;

function isWordAt(text: string, start: number): boolean {
  return start < text.length && WORD_RE.test(text.slice(start, start + 2));
}

export function moveWordRight(state: EditorState): EditorState {
  const text = state.value;
  const len = text.length;
  let i = state.cursor;
  while (i < len && !isWordAt(text, i)) {
    i = moveCodeUnit(text, i, 1);
  }
  while (i < len && isWordAt(text, i)) {
    i = moveCodeUnit(text, i, 1);
  }
  return { ...state, cursor: i, preferredCol: undefined };
}

export function moveWordLeft(state: EditorState): EditorState {
  const text = state.value;
  let i = state.cursor;
  while (i > 0 && !isWordAt(text, i - 1)) {
    i = moveCodeUnit(text, i, -1);
  }
  while (i > 0 && isWordAt(text, i - 1)) {
    i = moveCodeUnit(text, i, -1);
  }
  return { ...state, cursor: i, preferredCol: undefined };
}

export function deleteWordLeft(state: EditorState): EditorState {
  const start = moveWordLeft(state).cursor;
  if (start === state.cursor) {
    return state;
  }
  return {
    ...state,
    cursor: start,
    value: state.value.slice(0, start) + state.value.slice(state.cursor),
  };
}

export function deleteWordRight(state: EditorState): EditorState {
  const end = moveWordRight(state).cursor;
  if (end === state.cursor) {
    return state;
  }
  return {
    ...state,
    value: state.value.slice(0, state.cursor) + state.value.slice(end),
  };
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
