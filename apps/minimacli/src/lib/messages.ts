import type {
  AssistantComplete,
  AssistantDelta,
  ApprovalRequest,
  SessionEvent,
  ToolCall,
} from './harness';

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
  name: string;
  arguments: ToolArguments;
  streaming: boolean;
};

export type ChatApprovalMessage = {
  role: 'assistant';
  kind: 'approval';
  reason?: string;
  streaming: boolean;
};

export type ChatMessage = ChatTextMessage | ChatApprovalMessage | ChatToolCallMessage;

function appendTextMessage(
  messages: ChatMessage[],
  text: string,
  streaming: boolean
): ChatMessage[] {
  return [...messages, { role: 'assistant', kind: 'text', text, streaming }];
}

function appendToolCallMessage(
  messages: ChatMessage[],
  event: ToolCall
): ChatMessage[] {
  return [
    ...messages,
    {
      role: 'assistant',
      kind: 'tool-call',
      name: event.name,
      arguments: event.arguments,
      streaming: false,
    },
  ];
}

function appendApprovalMessage(
  messages: ChatMessage[],
  event: ApprovalRequest
): ChatMessage[] {
  return [
    ...messages,
    {
      role: 'assistant',
      kind: 'approval',
      reason: event.reason,
      streaming: false,
    },
  ];
}

function applyDelta(
  messages: ChatMessage[],
  event: AssistantDelta
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
  event: AssistantComplete
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
  event: SessionEvent
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
