export type ParseMessageEventResult =
  | null
  | { kind: 'assistant-delta'; text: string }
  | { kind: 'assistant-complete'; text: string };

export function parseMessageEvent(event: unknown): ParseMessageEventResult {
  if (!event || typeof event !== 'object') {
    return null;
  }
  const { type } = event as { type?: string };

  if (type === 'assistant/chunk') {
    const chunk = (event as { data?: { chunk?: { type?: string; text?: string } } }).data?.chunk;
    if (chunk?.type === 'text-delta' && typeof chunk.text === 'string') {
      return { kind: 'assistant-delta', text: chunk.text };
    }
    return null; // block-start, block-end, usage, finish — ignore
  }

  if (type === 'assistant/message') {
    const content = (event as { data?: { message?: { content?: Array<{ type?: string; text?: string }> } } })
      .data?.message?.content;
    const text = content
      ? content
          .filter((block) => block.type === 'text' && typeof block.text === 'string')
          .map((block) => block.text as string)
          .join('')
      : '';
    return { kind: 'assistant-complete', text };
  }

  return null;
}
