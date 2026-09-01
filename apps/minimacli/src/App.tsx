import React from 'react';
import Screen from './components/Screen';
import { HarnessProvider } from './context/HarnessContext';
import { SessionProvider } from './context/SessionContext';

export default function App({ forceNewSession = false }: { forceNewSession?: boolean }) {
  return (
    <HarnessProvider>
      <SessionProvider forceNewSession={forceNewSession}>
        <Screen />
      </SessionProvider>
    </HarnessProvider>
  );
}
