import type { Key } from 'ink';

export function keyToken(input: string, key: Key): string {
  const mods = key.ctrl ? 'ctrl+' : '';
  let base: string;
  if (key.escape) {
    base = 'esc';
  } else if (key.return) {
    base = 'enter';
  } else if (key.leftArrow) {
    base = 'left';
  } else if (key.rightArrow) {
    base = 'right';
  } else if (key.upArrow) {
    base = 'up';
  } else if (key.downArrow) {
    base = 'down';
  } else if (key.home) {
    base = 'home';
  } else if (key.end) {
    base = 'end';
  } else if (key.backspace) {
    base = 'backspace';
  } else if (key.delete) {
    base = 'delete';
  } else if (key.pageUp) {
    base = 'pageup';
  } else if (key.pageDown) {
    base = 'pagedown';
  } else {
    base = input === '' ? 'empty' : input;
  }
  return `${mods}${base}`;
}
