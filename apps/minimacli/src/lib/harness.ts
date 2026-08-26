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
