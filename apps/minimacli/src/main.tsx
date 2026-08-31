#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import Screen from './components/Screen';
import { HarnessProvider } from './context/HarnessContext';
import { SessionProvider } from './context/SessionContext';
import { parseCliArgs } from './lib/cli';
import { loadPlugins } from './lib/pluginStore';

const cli = parseCliArgs(process.argv.slice(2));

await loadPlugins();

render(
  <HarnessProvider>
    <SessionProvider forceNewSession={cli.newSession}>
      <Screen />
    </SessionProvider>
  </HarnessProvider>,
  { exitOnCtrlC: false }
);
