import { homedir } from 'node:os';

export function formatWorkspace(cwd: string): string {
  const home = homedir()
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

export function expandHome(path: string): string {
  const home = homedir();
  if (path === '~') {
    return home;
  }
  if (path.startsWith('~/')) {
    return `${home}/${path.slice(2)}`;
  }
  return path;
}
