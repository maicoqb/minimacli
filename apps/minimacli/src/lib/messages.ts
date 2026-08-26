export type ChatMessageRole = 'user' | 'assistant';

export type ChatTextMessage = {
  role: 'user' | 'assistant';
  kind: 'text';
  text: string;
  streaming: boolean;
};

export type ToolArguments = Record<string, unknown> | string;

export type ChatToolCallMessage = {
  role: 'assistant';
  kind: 'tool-call';
  callId: string;
  name: string;
  arguments: ToolArguments;
  streaming: boolean;
};

export type ChatApprovalMessage = {
  role: 'assistant';
  kind: 'approval';
  approvalId: string;
  toolName: string;
  reason?: string;
  text: string;
  streaming: boolean;
};

export type ChatMessage = ChatTextMessage | ChatApprovalMessage | ChatToolCallMessage;

export type MessageEvent =
  | { kind: 'assistant-delta'; text: string }
  | { kind: 'assistant-complete'; text: string }
  | { kind: 'tool-call'; callId: string; name: string; arguments: ToolArguments }
  | { kind: 'approval-requested'; approvalId: string; toolName: string; reason?: string };

function appendTextMessage(
  messages: ChatMessage[],
  text: string,
  streaming: boolean
): ChatMessage[] {
  return [...messages, { role: 'assistant', kind: 'text', text, streaming }];
}

function appendToolCallMessage(
  messages: ChatMessage[],
  event: { callId: string; name: string; arguments: ToolArguments }
): ChatMessage[] {
  if (messages.some((message) => message.kind === 'tool-call' && message.callId === event.callId)) {
    return messages;
  }
  return [
    ...messages,
    {
      role: 'assistant',
      kind: 'tool-call',
      callId: event.callId,
      name: event.name,
      arguments: event.arguments,
      streaming: false,
    },
  ];
}

function appendApprovalMessage(
  messages: ChatMessage[],
  event: Extract<MessageEvent, { kind: 'approval-requested' }>
): ChatMessage[] {
  const last = messages[messages.length - 1];
  if (last?.kind === 'approval' && last.approvalId === event.approvalId) {
    return messages;
  }
  return [
    ...messages,
    {
      role: 'assistant',
      kind: 'approval',
      approvalId: event.approvalId,
      toolName: event.toolName,
      reason: event.reason,
      text: event.reason ?? event.toolName,
      streaming: false,
    },
  ];
}

function applyDelta(
  messages: ChatMessage[],
  event: Extract<MessageEvent, { kind: 'assistant-delta' }>
): ChatMessage[] {
  const last = messages[messages.length - 1];
  if (last?.role === 'assistant' && last.kind === 'text' && last.streaming) {
    const copy = messages.slice();
    copy[copy.length - 1] = { ...last, text: last.text + event.text };
    return copy;
  }
  return appendTextMessage(messages, event.text, true);
}

function applyComplete(
  messages: ChatMessage[],
  event: Extract<MessageEvent, { kind: 'assistant-complete' }>
): ChatMessage[] {
  const last = messages[messages.length - 1];
  if (last?.role !== 'assistant') {
    return appendTextMessage(messages, event.text, false);
  }
  const copy = messages.slice();
  if (last.kind === 'text') {
    copy[copy.length - 1] = { ...last, text: event.text, streaming: false };
    return copy;
  }
  copy[copy.length - 1] = { ...last, streaming: false };
  return appendTextMessage(copy, event.text, false);
}

export function updateMessages(
  messages: ChatMessage[],
  event: MessageEvent
): ChatMessage[] {
  switch (event.kind) {
    case 'assistant-delta':
      return applyDelta(messages, event);
    case 'assistant-complete':
      return applyComplete(messages, event);
    case 'tool-call':
      return appendToolCallMessage(messages, event);
    case 'approval-requested':
      return appendApprovalMessage(messages, event);
    default:
      return messages;
  }
}
