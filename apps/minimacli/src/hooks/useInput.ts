import { useRef } from 'react';
import { useInput as useInkInput } from 'ink';
import { resolveKey, type CommandAction, type InputContext } from '../lib/commands';

type Handler = (action: CommandAction) => void;

type UseInputOptions = {
  isActive?: boolean;
  contexts: InputContext[];
};

export function useInput(options: UseInputOptions): (handler: Handler) => void {
  const contextsRef = useRef<InputContext[]>(options.contexts);
  const handlerRef = useRef<Handler | null>(null);

  useInkInput(
    (input, key) => {
      if (!handlerRef.current) {
        return;
      }
      const actions = resolveKey(contextsRef.current, input, key);
      for (const action of actions) {
        handlerRef.current(action);
      }
    },
    { isActive: options.isActive ?? true }
  );

  return (handler: Handler) => {
    handlerRef.current = handler;
  };
}
