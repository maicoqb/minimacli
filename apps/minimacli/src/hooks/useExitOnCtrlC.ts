import { useApp, useInput as useInkInput } from 'ink';
import { useState } from 'react';
import { useHarness } from '../context/HarnessContext';
import { keyToken } from '../lib/keys';
import { useInput } from './useInput';

export function useExitOnCtrlC() {
  const { isTurnActive, cancel } = useHarness();
  const { exit } = useApp();
  const onInput = useInput();
  const [exitPending, setExitPending] = useState(false);

  useInkInput((input, key) => {
    if (keyToken(input, key) !== 'ctrl+c') {
      setExitPending(false);
    }
  });

  onInput((action) => {
    if (action.type !== 'cancel') {
      return;
    }
    if (isTurnActive) {
      cancel().catch(() => undefined);
      return;
    }
    if (exitPending) {
      exit();
      return;
    }
    setExitPending(true);
  });

  return exitPending;
}
