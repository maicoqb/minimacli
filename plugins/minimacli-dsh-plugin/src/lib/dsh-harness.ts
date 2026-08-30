import type {
  Harness,
  HarnessDescriptor,
  PromptAccepted,
  QuestionAnswer,
  SessionCreated,
  SessionEvent,
} from '@minimacli/plugin';
import { parseEvent, type MuxFrame, type ApprovalRequest, type QuestionRequest } from './dsh-events';

type Options = {
  url: string;
};

type ServerResponse<T> =
  | { type: 'server-response'; rpcId: string; result: { ok: true; value: T } }
  | { type: 'server-response'; rpcId: string; result: { ok: false; error: unknown } };

async function callRpc<T>(url: string, method: string, payload: unknown): Promise<T> {
  const message = {
    type: 'client-request',
    rpcId: crypto.randomUUID(),
    method,
    payload,
  };

  const response = await fetch(`${url}/api/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`${method} failed: HTTP ${response.status}`);
  }

  const body = (await response.json()) as ServerResponse<T>;
  if (!body.result.ok) {
    throw new Error(`${method} returned an error result`);
  }

  return body.result.value;
}

function createSession(url: string, cwd?: string): Promise<SessionCreated> {
  return callRpc<SessionCreated>(url, 'session.create', cwd ? { cwd } : {});
}

function describe(url: string): Promise<HarnessDescriptor> {
  return callRpc<HarnessDescriptor>(url, 'host.describe', {});
}

function prompt(url: string, sessionId: string, text: string): Promise<PromptAccepted> {
  return callRpc<PromptAccepted>(url, 'session.prompt', {
    sessionId,
    mode: 'queue',
    content: [{ type: 'text', text }],
  });
}

function cancel(url: string, sessionId: string): Promise<void> {
  return callRpc<void>(url, 'session.cancel', { sessionId });
}

async function respondApproval(
  url: string,
  request: ApprovalRequest,
  decision: 'allow' | 'deny'
): Promise<void> {
  const outcome = decision === 'allow' ? 'allowed-once' : 'rejected';
  const response = await fetch(`${url}/api/respond`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'client-response',
      rpcId: request.rpcId,
      result: {
        ok: true,
        value: {
          sessionId: request.sessionId,
          approvalId: request.approvalId,
          outcome,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`respond failed: HTTP ${response.status}`);
  }
}

async function respondQuestion(
  url: string,
  request: QuestionRequest,
  answer: QuestionAnswer
): Promise<void> {
  const response = await fetch(`${url}/api/respond`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'client-response',
      rpcId: request.rpcId,
      result: {
        ok: true,
        value: {
          sessionId: request.sessionId,
          answer,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`respond failed: HTTP ${response.status}`);
  }
}

function toWsUrl(httpUrl: string, path: string): string {
  const url = new URL(path, httpUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function streamEvents(
  url: string,
  sessionId: string,
  onEvent: (event: SessionEvent) => void,
  signal?: AbortSignal,
  onClose?: () => void
): void {
  const socket = new WebSocket(toWsUrl(url, '/api/events.mux'));
  socket.onmessage = (event) => {
    const data = event.data;
    if (typeof data !== 'string') {
      return;
    }
    const envelope = JSON.parse(data) as { rpcId?: string; payload?: unknown };
    const frame = envelope.payload as MuxFrame | undefined;
    const rpcId = envelope.rpcId;
    if (!frame || typeof rpcId !== 'string' || frame.sessionId !== sessionId) {
      return;
    }
    const parsed = parseEvent(frame, rpcId);
    if (parsed) {
      onEvent(parsed);
    }
  };
  socket.onclose = () => onClose?.();
  signal?.addEventListener('abort', () => socket.close());
}

export function createHarnessDsh({ url }: Options): Harness {
  return {
    sessionId: '',
    describe: () => describe(url),
    createSession: (cwd) => createSession(url, cwd),
    prompt: (sessionId, text) => prompt(url, sessionId, text),
    cancel: (sessionId) => cancel(url, sessionId),
    streamEvents: (sid, onEvent, signal?, onClose?) =>
      streamEvents(url, sid, onEvent, signal, onClose),
    respondApproval: (request, decision) =>
      respondApproval(url, request as ApprovalRequest, decision),
    respondQuestion: (request, answer) =>
      respondQuestion(url, request as QuestionRequest, answer),
  };
}
