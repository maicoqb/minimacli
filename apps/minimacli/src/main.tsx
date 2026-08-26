#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import Screen from './components/Screen';
import { HarnessProvider } from './context/HarnessContext';
import { DEFAULT_HARNESS_URL } from './lib/harness';

render(
  <HarnessProvider url={DEFAULT_HARNESS_URL}>
    <Screen />
  </HarnessProvider>,
  { exitOnCtrlC: false }
);
