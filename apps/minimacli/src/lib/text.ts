import stringWidth from 'string-width';

export type Line = { start: number; widths: number[]; endsWithNewline: boolean };

export function buildLines(text: string, wrapWidth: number): Line[] {
  const lines: Line[] = [];
  let start = 0;
  let widths: number[] = [];
  let col = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\n') {
      lines.push({ start, widths, endsWithNewline: true });
      start = i + 1;
      widths = [];
      col = 0;
      continue;
    }
    const w = stringWidth(ch);
    if (col > 0 && col + w > wrapWidth) {
      lines.push({ start, widths, endsWithNewline: false });
      start = i;
      widths = [];
      col = 0;
    }
    widths.push(w);
    col += w;
  }

  lines.push({ start, widths, endsWithNewline: text.endsWith('\n') });
  return lines;
}

export function idxToPos(lines: Line[], idx: number): { row: number; col: number } {
  const n = lines.length;
  for (let r = 0; r < n; r++) {
    const line = lines[r];
    const nextStart = r + 1 < n ? lines[r + 1].start : idx;
    if (idx >= line.start && (idx < nextStart || r === n - 1)) {
      const offset = Math.min(idx - line.start, line.widths.length);
      const col = line.widths.slice(0, offset).reduce((a, b) => a + b, 0);
      return { row: r, col };
    }
  }
  return { row: n - 1, col: lines[n - 1]?.widths.reduce((a, b) => a + b, 0) ?? 0 };
}

export function posToIdx(lines: Line[], row: number, targetCol: number): number {
  if (row < 0) {
    return 0;
  }
  if (row >= lines.length) {
    return lines[lines.length - 1]?.start ?? 0;
  }
  const line = lines[row];
  let colAcc = 0;
  let offset = 0;
  for (let k = 0; k < line.widths.length; k++) {
    if (colAcc + line.widths[k] > targetCol) {
      break;
    }
    colAcc += line.widths[k];
    offset = k + 1;
  }
  return line.start + offset;
}

function isLowSurrogate(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0xdc00 && code <= 0xdfff;
}

export function moveCodeUnit(text: string, idx: number, delta: 1 | -1): number {
  if (delta === 1) {
    if (idx >= text.length) {
      return idx;
    }
    const next = idx + 1;
    const isHigh = text.charCodeAt(idx) >= 0xd800 && text.charCodeAt(idx) <= 0xdbff;
    return isHigh && next < text.length && isLowSurrogate(text[next]) ? next + 1 : next;
  }
  if (idx <= 0) {
    return 0;
  }
  const prev = idx - 1;
  const prevIsLow = isLowSurrogate(text[prev]);
  return prevIsLow && prev > 0 ? prev - 1 : prev;
}

export function clamp(idx: number, len?: number): number {
  if (len === undefined) {
    return Math.max(0, idx);
  }
  return Math.max(0, Math.min(idx, len));
}
