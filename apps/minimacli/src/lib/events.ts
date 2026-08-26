import type { MuxFrame } from './harness';
import type { MessageEvent } from './messages';

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
    const chunk = (event as { data?: { chunk?: { type?: string; text?: string } } }).data?.chunk;
    if (chunk?.type === 'text-delta' && typeof chunk.text === 'string') {
      return { kind: 'assistant-delta', text: chunk.text };
    }
    return null;
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

export function parseEvent(frame: MuxFrame): MessageEvent | null {
  if (frame.type === 'approval/requested') {
    return parseApproval(frame);
  }
  if (frame.type === 'session/event') {
    return parseStreamEvent((frame as { event?: unknown }).event);
  }
  return null;
}
