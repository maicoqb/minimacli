import { useRef } from 'react';
import { useInput as useInkInput } from 'ink';
import { resolveKey, type CommandAction } from '../lib/commands';

type Handler = (action: CommandAction) => void;

export function useInput(options?: { isActive?: boolean }): (handler: Handler) => void {
  const handlerRef = useRef<Handler | null>(null);

  useInkInput(
    (input, key) => {
      const action = resolveKey(input, key);
      if (!action || !handlerRef.current) {
        return;
      }
      handlerRef.current(action);
    },
    { isActive: options?.isActive ?? true }
  );

  return (handler: Handler) => {
    handlerRef.current = handler;
  };
}
