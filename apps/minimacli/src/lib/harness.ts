export const DEFAULT_HARNESS_URL = 'http://127.0.0.1:3080';

export type HarnessStatus = 'checking' | 'up' | 'down';

export type HarnessDescriptor = {
  version: string;
  cwd: string;
  provider: string;
  model: string;
  attachedSessions: number;
  home: string;
  canOpenPath: boolean;
};

export type SessionCreated = {
  sessionId: string;
  agentPreset?: string;
};

export type PromptAccepted = {
  accepted: true;
  command?: { kind: 'success'; text?: string };
};

type ServerResponse<T> =
  | { type: 'server-response'; rpcId: string; result: { ok: true; value: T } }
  | { type: 'server-response'; rpcId: string; result: { ok: false; error: unknown } };

export type Harness = ReturnType<typeof createHarness>;

export type MuxFrame = { type: string; sessionId?: string } & Record<string, unknown>;

function toWsUrl(httpUrl: string, path: string): string {
  const url = new URL(path, httpUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

export function streamEvents(
  url: string,
  sessionId: string,
  onFrame: (frame: MuxFrame) => void,
  signal?: AbortSignal
): void {
  const socket = new WebSocket(toWsUrl(url, '/api/events.mux'));
  socket.onmessage = (event) => {
    const data = event.data;
    if (typeof data !== 'string') {
      return;
    }
    const envelope = JSON.parse(data) as { payload?: unknown };
    const frame = envelope.payload as MuxFrame | undefined;
    if (frame && frame.sessionId === sessionId) {
      onFrame(frame);
    }
  };
  signal?.addEventListener('abort', () => socket.close());
}

export function describe(url: string): Promise<HarnessDescriptor> {
  return callRpc<HarnessDescriptor>(url, 'host.describe', {});
}

export function createSession(url: string, cwd?: string): Promise<SessionCreated> {
  return callRpc<SessionCreated>(url, 'session.create', cwd ? { cwd } : {});
}

export function prompt(url: string, sessionId: string, text: string): Promise<PromptAccepted> {
  return callRpc<PromptAccepted>(url, 'session.prompt', {
    sessionId,
    mode: 'queue',
    content: [{ type: 'text', text }],
  });
}

export function createHarness(url: string) {
  return {
    describe: () => describe(url),
    createSession: (cwd?: string) => createSession(url, cwd),
    prompt: (sessionId: string, text: string) => prompt(url, sessionId, text),
    streamEvents: (sessionId: string, onFrame: (frame: MuxFrame) => void, signal?: AbortSignal) =>
      streamEvents(url, sessionId, onFrame, signal),
  };
}

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
