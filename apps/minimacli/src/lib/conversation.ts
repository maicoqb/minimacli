import { buildLines, sliceLines } from './text';
import type { ChatMessage, ChatMessageRole, ToolArguments } from './messages';

export type DisplayLine =
  | { kind: 'separator' }
  | { kind: 'message'; text: string; role: ChatMessageRole; first: boolean }
  | { kind: 'tool'; name: string; arguments: ToolArguments }
  | { kind: 'approval-tool'; tool: string };

function splitText(text: string, width: number): { line: string; first: boolean }[] {
  const built = buildLines(text, width);
  return built.map((_chunk, index) => ({
    line: sliceLines(text, built, index, index + 1).replace(/\n$/, ''),
    first: index === 0,
  }));
}

export function buildDisplayLines(
  messages: ChatMessage[],
  width: number
): { lines: DisplayLine[]; focusIndex?: number } {
  const bodyWidth = Math.max(1, width - 2);
  const lines: DisplayLine[] = [];
  let approvalToolIndex: number | undefined;

  for (const message of messages) {
    if (message.role === 'user') {
      lines.push({ kind: 'separator' });
    }

    if (message.kind === 'approval') {
      approvalToolIndex = lines.length;
      for (const { line, first } of splitText(message.reason ?? '', bodyWidth)) {
        lines.push({ kind: 'message', text: line, role: message.role, first });
      }
      continue;
    }

    if (message.kind === 'tool-call') {
      lines.push({ kind: 'tool', name: message.name, arguments: message.arguments });
      continue;
    }

    for (const { line, first } of splitText(message.text, bodyWidth)) {
      lines.push({ kind: 'message', text: line, role: message.role, first });
    }
  }

  const last = messages[messages.length - 1];
  return {
    lines,
    focusIndex: last?.kind === 'approval' ? approvalToolIndex : undefined,
  };
}
