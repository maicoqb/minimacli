import type { MuxFrame, HarnessDescriptor, HarnessStatus } from './harness';
import { describe, createSession, prompt, cancel, streamEvents } from './harness';

export type Connection = ReturnType<typeof createConnection>;

export function createConnection(url: string) {
  return {
    describe: () => describe(url),
    createSession: (cwd?: string) => createSession(url, cwd),
    prompt: (sessionId: string, text: string) => prompt(url, sessionId, text),
    cancel: (sessionId: string) => cancel(url, sessionId),
    streamEvents: (
      sessionId: string,
      onFrame: (frame: MuxFrame) => void,
      signal?: AbortSignal,
      onClose?: () => void
    ) => streamEvents(url, sessionId, onFrame, signal, onClose),
  };
}

const connectionCache = new Map<string, Connection>();

export function getConnection(url: string): Connection {
  let connection = connectionCache.get(url);
  if (!connection) {
    connection = createConnection(url);
    connectionCache.set(url, connection);
  }
  return connection;
}
