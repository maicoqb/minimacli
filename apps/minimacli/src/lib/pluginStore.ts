import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { expandHome } from './path';
import type { Plugin, PluginKind } from '@minimacli/plugin';

type PluginConfig = {
  id: string;
  kind: PluginKind;
  active: boolean;
  options: Record<string, string>;
  module: string;
};

type PluginsFile = {
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

function getPluginsFile(): string {
  return join(homedir(), '.minimacli', 'plugins.json');
}

function readPluginsFile(): PluginsFile {
  try {
    const raw = readFileSync(getPluginsFile(), 'utf-8');
    return JSON.parse(raw) as PluginsFile;
  } catch {
    return { plugins: [] };
  }
}

export async function loadPlugins(): Promise<void> {
  const file = readPluginsFile();
  console.error('[loadPlugins] plugins in file:', file.plugins.length);
  for (const config of file.plugins) {
    const entry = resolveEntry(expandHome(config.module));
    console.error('[loadPlugins] loading', config.id, 'entry:', entry);
    try {
      const module = (await import(/* webpackIgnore: true */ pathToFileURL(entry).href)) as Record<
        string,
        unknown
      >;
      const plugin = extractPlugin(module);
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
