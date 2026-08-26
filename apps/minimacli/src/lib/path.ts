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
