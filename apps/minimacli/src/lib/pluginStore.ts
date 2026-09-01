import { readFileSync, writeFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { expandHome } from './path';
import type { Plugin, PluginKind } from '@minimacli/plugin';

export type PluginConfig = {
  id: string;
  kind: PluginKind;
  active: boolean;
  options: Record<string, string>;
  module: string;
};

export type PluginsFile = {
  plugins: PluginConfig[];
};

export type PluginFilter = {
  kind?: PluginKind;
  active?: boolean;
};

export type PluginEntry = {
  plugin: Plugin;
  options: Record<string, string>;
  active: boolean;
};

const pluginStore = new Map<string, PluginEntry>();

export function getPluginsFile(): string {
  return join(homedir(), '.minimacli', 'plugins.json');
}

export function readPluginsFile(): PluginsFile {
  try {
    const raw = readFileSync(getPluginsFile(), 'utf-8');
    return JSON.parse(raw) as PluginsFile;
  } catch {
    return { plugins: [] };
  }
}

export function savePluginsFile(file: PluginsFile): void {
  const dir = join(homedir(), '.minimacli');
  mkdirSync(dir, { recursive: true });
  writeFileSync(getPluginsFile(), JSON.stringify(file, null, 2), 'utf-8');
}

export function upsertPluginConfig(config: PluginConfig): void {
  const file = readPluginsFile();
  const next = [
    ...file.plugins.filter(
      (entry) => entry.id !== config.id && entry.module !== config.module
    ),
    config,
  ];

  savePluginsFile({ plugins: next });
}

export async function loadPluginFromDir(modulePath: string): Promise<Plugin> {
  const entry = resolveEntry(expandHome(modulePath));
  const module = (await import(/* webpackIgnore: true */ pathToFileURL(entry).href)) as Record<
    string,
    unknown
  >;
  return extractPlugin(module);
}

export async function loadPlugins(): Promise<void> {
  const file = readPluginsFile();
  console.error('[loadPlugins] plugins in file:', file.plugins.length);
  for (const config of file.plugins) {
    const entry = resolveEntry(expandHome(config.module));
    console.error('[loadPlugins] loading', config.id, 'entry:', entry);
    try {
      const plugin = await loadPluginFromDir(config.module);
      console.error('[loadPlugins] plugin', config.id, 'id:', plugin?.id, 'kind:', plugin?.kind);
      pluginStore.set(config.id, {
        plugin,
        options: config.options,
        active: config.active,
      });
    } catch (err) {
      console.error('failed to load plugin', config.id, JSON.stringify(entry), err);
    }
  }
}

function extractPlugin(module: Record<string, unknown>): Plugin {
  const candidates: unknown[] = [
    module.default,
    (module.default as Record<string, unknown> | undefined)?.default,
    module
  ];
  for (const candidate of candidates) {
    if (isPluginShape(candidate)) {
      return candidate;
    }
  }
  throw new Error('No plugin object found in module');
}

function isPluginShape(value: unknown): value is Plugin {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Plugin).id === 'string' &&
    typeof (value as Plugin).kind === 'string'
  );
}

function resolveEntry(modulePath: string): string {
  try {
    const pkg = JSON.parse(readFileSync(join(modulePath, 'package.json'), 'utf-8')) as {
      main?: string;
    };
    if (pkg.main) {
      return join(modulePath, pkg.main);
    }
  } catch {
    // no package.json at that path; fall through.
  }

  const segments = modulePath.split(/[\\/]/).filter(Boolean);
  const name = segments.at(-1);
  const parent = segments.at(-2);

  if (name) {
    const scopedCandidate = parent?.startsWith('@')
      ? join(modulePath, 'node_modules', parent, name)
      : join(modulePath, 'node_modules', name);

    try {
      const pkg = JSON.parse(readFileSync(join(scopedCandidate, 'package.json'), 'utf-8')) as {
        main?: string;
      };
      if (pkg.main) {
        return join(scopedCandidate, pkg.main);
      }
      return scopedCandidate;
    } catch {
      // keep the original modulePath for plain directories without package metadata.
    }
  }

  return modulePath;
}

export function getPlugins(filter?: PluginFilter): PluginEntry[] {
  console.error('[getPlugins] store size:', pluginStore.size, 'filter:', filter);
  return [...pluginStore.values()].filter((entry) => {
    const { plugin, active } = entry;
    if (filter?.kind && plugin.kind !== filter.kind) {
      return false;
    }
    if (filter?.active !== undefined && active !== filter.active) {
      return false;
    }
    return true;
  });
}
