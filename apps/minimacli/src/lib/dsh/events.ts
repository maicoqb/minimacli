import type {
  SessionEvent as ISessionEvent,
  ApprovalRequest as IApprovalRequest,
  ToolArguments
} from '../harness';

type BaseMuxFrame = {
  type: string;
  sessionId?: string
} & Record<string, unknown>;

type AssistantChunkChunk = {
  type?: string;
  text?: string
};
type AssistantChunkEvent = {
  type: 'assistant/chunk';
  data: { chunk?: AssistantChunkChunk }
};

type AssistantMessageContent = {
  type?: string;
  text?: string
};
type AssistantMessageEvent = {
  type: 'assistant/message';
  data: { message?: { content?: AssistantMessageContent[] } };
};

type ToolCallData = {
  callId?: unknown;
  name?: unknown;
  arguments?: unknown
};
type ToolCallEvent = {
  type: 'tool/call';
  data: ToolCallData
};

type SessionStreamEvent =
  | AssistantChunkEvent
  | AssistantMessageEvent
  | ToolCallEvent;

type SessionEventMuxFrame = BaseMuxFrame & {
  type: 'session/event';
  event: SessionStreamEvent;
};
type ApprovalMuxFrame = BaseMuxFrame & {
  type: 'approval/requested';
  sessionId?: unknown;
  approvalId?: unknown;
  reason?: unknown;
};

export type MuxFrame = SessionEventMuxFrame | ApprovalMuxFrame;

export type SessionEvent = ISessionEvent & {
  rpcId: string
}

export type ApprovalRequest = IApprovalRequest & {
  rpcId: string;
  sessionId: string;
  approvalId: string;
};

function parseApproval(frame: ApprovalMuxFrame, rpcId: string): ApprovalRequest | null {
  const { sessionId, approvalId, reason } = frame;
  if (
    typeof rpcId !== 'string' ||
    typeof sessionId !== 'string' ||
    typeof approvalId !== 'string' ||
    typeof reason !== 'string'
  ) {
    return null;
  }
  return { kind: 'approval-requested', reason, rpcId, sessionId, approvalId };
}

function parseAssistantChunk(event: AssistantChunkEvent, rpcId: string): SessionEvent | null {
  const chunk = event.data?.chunk;
  if (chunk?.type === 'text-delta' && typeof chunk.text === 'string') {
    return { kind: 'assistant-delta', text: chunk.text, rpcId };
  }
  return null;
}

function parseAssistantMessage(event: AssistantMessageEvent, rpcId: string): SessionEvent | null {
  const content = event.data?.message?.content;
  const text = content
    ? content
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text as string)
      .join('')
    : '';
  return { kind: 'assistant-complete', text, rpcId };
}

function parseToolCall(event: ToolCallEvent, rpcId: string): SessionEvent | null {
  const { name, arguments: raw } = event.data ?? {};
  if (typeof name !== 'string' || typeof raw !== 'string') {
    return null;
  }
  const parsed = (() => {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return raw;
    }
  })();
  return { kind: 'tool-call', name, arguments: parsed as ToolArguments, rpcId };
}

function parseSessionEvent(event: SessionStreamEvent, rpcId: string): SessionEvent | null {
  if (event.type === 'assistant/chunk') {
    return parseAssistantChunk(event, rpcId);
  }

  if (event.type === 'assistant/message') {
    return parseAssistantMessage(event, rpcId);
  }

  if (event.type === 'tool/call') {
    return parseToolCall(event, rpcId);
  }

  return null;
}

export function parseEvent(frame: MuxFrame, rpcId: string): SessionEvent | ApprovalRequest | null {
  if (frame.type === 'approval/requested') {
    return parseApproval(frame, rpcId);
  }
  if (frame.type === 'session/event') {
    return parseSessionEvent(frame.event, rpcId);
  }
  return null;
}
