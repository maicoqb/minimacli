import type { MuxFrame } from './harness';
import type { MessageEvent } from './messages';

type TextChunk = { type?: string; text?: string };
type ContentBlock = { type?: string; text?: string };
type ToolCallData = { callId?: unknown; name?: unknown; arguments?: unknown };

type AssistantChunkEvent = { type: 'assistant/chunk'; data: { chunk?: TextChunk } };
type AssistantMessageEvent = {
  type: 'assistant/message';
  data: { message?: { content?: ContentBlock[] } };
};
type ToolCallEvent = { type: 'tool/call'; data: ToolCallData };

function parseApproval(frame: MuxFrame): MessageEvent | null {
  const { approvalId, toolName, reason } = frame as {
    approvalId?: unknown;
    toolName?: unknown;
    reason?: unknown;
  };
  if (typeof approvalId !== 'string' || typeof toolName !== 'string') {
    return null;
  }
  return {
    kind: 'approval-requested',
    approvalId,
    toolName,
    reason: typeof reason === 'string' ? reason : undefined,
  };
}

function parseStreamEvent(event: unknown): MessageEvent | null {
  if (!event || typeof event !== 'object') {
    return null;
  }
  const { type } = event as { type?: string };

  if (type === 'assistant/chunk') {
    const chunk = (event as AssistantChunkEvent).data?.chunk;
    if (chunk?.type === 'text-delta' && typeof chunk.text === 'string') {
      return { kind: 'assistant-delta', text: chunk.text };
    }
    return null;
  }

  if (type === 'assistant/message') {
    const content = (event as AssistantMessageEvent).data?.message?.content;
    const text = content
      ? content
          .filter((block) => block.type === 'text' && typeof block.text === 'string')
          .map((block) => block.text as string)
          .join('')
      : '';
    return { kind: 'assistant-complete', text };
  }

  if (type === 'tool/call') {
    const { callId, name, arguments: raw } = (event as ToolCallEvent).data ?? {};
    if (typeof callId !== 'string' || typeof name !== 'string' || typeof raw !== 'string') {
      return null;
    }
    const parsed = (() => {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return raw;
      }
    })();
    return { kind: 'tool-call', callId, name, arguments: parsed };
  }

  return null;
}

export function parseEvent(frame: MuxFrame): MessageEvent | null {
  if (frame.type === 'approval/requested') {
    return parseApproval(frame);
  }
  if (frame.type === 'session/event') {
    return parseStreamEvent((frame as { event?: unknown }).event);
  }
  return null;
}
