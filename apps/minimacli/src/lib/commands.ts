import type { Key } from 'ink';
import { keyToken } from './keys';

export type InputContext =
  | 'approval'
  | 'question'
  | 'harness'
  | 'prompt'
  | 'scroll'
  | 'exit';

export type HarnessCommandAction = { type: 'harness.retry' };

export type ApprovalCommandAction =
  | { type: 'approval.up' }
  | { type: 'approval.down' }
  | { type: 'approval.submit' };

export type QuestionCommandAction =
  | { type: 'question.up' }
  | { type: 'question.down' }
  | { type: 'question.submit' };

export type PromptCommandAction =
  | { type: 'prompt.submit' }
  | { type: 'prompt.clear' };

export type ScrollCommandAction =
  | { type: 'scroll.pageUp' }
  | { type: 'scroll.pageDown' }
  | { type: 'scroll.up' }
  | { type: 'scroll.down' };

export type ExitCommandAction = { type: 'exit.cancel' };

export type CommandAction =
  | HarnessCommandAction
  | ApprovalCommandAction
  | QuestionCommandAction
  | PromptCommandAction
  | ScrollCommandAction
  | ExitCommandAction;

const keymaps: Record<InputContext, Record<string, CommandAction | null>> = {
  harness: {
    'ctrl+r': { type: 'harness.retry' },
  },
  approval: {
    up: { type: 'approval.up' },
    down: { type: 'approval.down' },
    enter: { type: 'approval.submit' },
  },
  question: {
    up: { type: 'question.up' },
    down: { type: 'question.down' },
    enter: { type: 'question.submit' },
  },
  prompt: {
    enter: { type: 'prompt.submit' },
    esc: { type: 'prompt.clear' },
  },
  scroll: {
    pageup: { type: 'scroll.pageUp' },
    pagedown: { type: 'scroll.pageDown' },
    'ctrl+up': { type: 'scroll.up' },
    'ctrl+down': { type: 'scroll.down' },
  },
  exit: {
    'ctrl+c': { type: 'exit.cancel' },
  },
};

export function resolveKey(
  contexts: InputContext[],
  input: string,
  key: Key
): CommandAction[] {
  const token = keyToken(input, key);
  return contexts
    .map((context) => keymaps[context][token])
    .filter((action): action is CommandAction => action !== null && action !== undefined);
}
