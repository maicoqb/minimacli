import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

type SessionEntry = {
  pwd: string;
  lastUsedAt: number;
};

type SessionMap = Record<string, SessionEntry>;

function getSessionsFile(): string {
  return join(homedir(), '.minimacli', 'sessions.json');
}

function readSessionMap(): SessionMap {
  try {
    const raw = readFileSync(getSessionsFile(), 'utf-8');
    return JSON.parse(raw) as SessionMap;
  } catch {
    return {};
  }
}

function writeSessionMap(map: SessionMap): void {
  mkdirSync(join(homedir(), '.minimacli'), { recursive: true });
  writeFileSync(getSessionsFile(), `${JSON.stringify(map, null, 2)}\n`, 'utf-8');
}

export function getLastSessionId(pwd: string): string | null {
  const map = readSessionMap();
  return Object.entries(map)
    .filter(([, entry]) => entry.pwd === pwd)
    .sort(([, a], [, b]) => b.lastUsedAt - a.lastUsedAt)[0]?.[0] ?? null;
}

export function touchSession(sessionId: string, pwd: string): void {
  const map = readSessionMap();
  map[sessionId] = { pwd, lastUsedAt: Date.now() };
  writeSessionMap(map);
}
