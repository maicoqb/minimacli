export type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
  streaming: boolean;
};

export type MessageEvent =
  | { kind: 'assistant-delta'; text: string }
  | { kind: 'assistant-complete'; text: string };

export function updateMessages(
  messages: ChatMessage[],
  event: MessageEvent
): ChatMessage[] {
  const last = messages[messages.length - 1];

  if (event.kind === 'assistant-delta') {
    if (last?.role === 'assistant' && last.streaming) {
      const copy = messages.slice();
      copy[copy.length - 1] = { ...last, text: last.text + event.text };
      return copy;
    }
    return [...messages, { role: 'assistant', text: event.text, streaming: true }];
  }

  // assistant-complete
  if (last?.role === 'assistant') {
    const copy = messages.slice();
    copy[copy.length - 1] = { ...last, text: event.text, streaming: false };
    return copy;
  }
  return [...messages, { role: 'assistant', text: event.text, streaming: false }];
}
