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

export function formatWorkspace(cwd: string, home: string): string {
  const norm = (p: string) => p.replace(/\\/g, '/').replace(/\/+$/, '');
  const c = norm(cwd);
  const h = norm(home);
  if (c === h) {
    return '~';
  }
  if (c.startsWith(`${h}/`)) {
    return `~${c.slice(h.length)}`;
  }
  return cwd;
}

type ServerResponse =
  | { type: 'server-response'; rpcId: string; result: { ok: true; value: HarnessDescriptor } }
  | { type: 'server-response'; rpcId: string; result: { ok: false; error: unknown } };

export async function describeHarness(url: string): Promise<HarnessDescriptor> {
  const message = {
    type: 'client-request',
    rpcId: crypto.randomUUID(),
    method: 'host.describe',
    payload: {},
  };
  const response = await fetch(`${url}/api/host.describe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    throw new Error(`host.describe failed: HTTP ${response.status}`);
  }
  const body = (await response.json()) as ServerResponse;
  if (!body.result.ok) {
    throw new Error('host.describe returned an error result');
  }
  return body.result.value;
}
