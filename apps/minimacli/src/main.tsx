#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import Screen from './components/Screen';
import { HarnessProvider } from './context/HarnessContext';
import { SessionProvider } from './context/SessionContext';
import { DEFAULT_HARNESS_URL } from './lib/harness';
import { parseCliArgs } from './lib/cli';

const cli = parseCliArgs(process.argv.slice(2));

render(
  <HarnessProvider url={DEFAULT_HARNESS_URL}>
    <SessionProvider forceNewSession={cli.newSession}>
      <Screen />
    </SessionProvider>
  </HarnessProvider>,
  { exitOnCtrlC: false }
);
