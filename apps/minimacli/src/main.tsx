#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './App';
import { parseCliArgs } from './lib/cli';
import { installPlugin } from './lib/installPlugin';
import { loadPlugins } from './lib/pluginStore';

const cli = parseCliArgs(process.argv.slice(2));

if (cli.install) {
  await installPlugin(cli.install);
  process.exit(0);
}

await loadPlugins();

render(
  <App forceNewSession={cli.newSession} />,
  { exitOnCtrlC: false }
);
