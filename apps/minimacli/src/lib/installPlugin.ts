import { mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadPluginFromDir, upsertPluginConfig } from './pluginStore';

function parsePackageName(specifier: string): { packageName: string; installSpec: string } {
  const scopeMatch = specifier.match(/^(@[^/]+\/[^@]+)(?:@.+)?$/);
  if (scopeMatch) {
    return { packageName: scopeMatch[1], installSpec: specifier };
  }

  const match = specifier.match(/^([^@]+)(?:@.+)?$/);
  if (match) {
    return { packageName: match[1], installSpec: specifier };
  }

  return { packageName: specifier, installSpec: specifier };
}

async function runNpm(args: string[], cwd: string): Promise<void> {
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd.exe' : 'npm';
  const spawnArgs = isWindows ? ['/c', 'npm.cmd', ...args] : args;

  console.log('[installPlugin] executing:', command, spawnArgs.join(' '));

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, spawnArgs, {
      cwd,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`npm command failed with exit code ${code}: ${args.join(' ')}`));
    });
  });
}

export async function installPlugin(pluginName: string): Promise<void> {
  const { packageName, installSpec } = parsePackageName(pluginName);
  const pluginDir = join(homedir(), '.minimacli', 'plugins', packageName);
  const pluginModuleDir = join(pluginDir, 'node_modules', packageName);

  await mkdir(pluginDir, { recursive: true });
  await runNpm(['install', installSpec], pluginDir);

  const plugin = await loadPluginFromDir(pluginModuleDir);

  upsertPluginConfig({
    id: packageName,
    kind: plugin.kind,
    active: true,
    options: plugin.defaultOptions ?? {},
    module: pluginModuleDir,
  });

  console.log(`[installPlugin] registered ${packageName} in ${join(homedir(), '.minimacli', 'plugins.json')}`);
  console.log(`[installPlugin] installed ${packageName} in ${pluginModuleDir}`);
}
