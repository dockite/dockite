import mitt, { Emitter } from 'mitt';

let emitter: Emitter;

export interface useEventHook {
  on: (action: string, callback: () => void) => void;
  onAll: (actions: string[], callback: () => void) => void;

  off: (action: string, callback: () => void) => void;
  offAll: (actions: string[], callback: () => void) => void;

  emit: (action: string) => void;
}

export const useEvent = (): useEventHook => {
  if (!emitter) {
    emitter = mitt();
  }

  const on = (action: string, callback: () => void): void => {
    emitter.on(action, callback);
  };

  const onAll = (actions: string[], callback: () => void): void => {
    actions.forEach(action => {
      emitter.on(action, callback);
    });
  };

  const off = (action: string, callback: () => void): void => {
    emitter.off(action, callback);
  };

  const offAll = (actions: string[], callback: () => void): void => {
    actions.forEach(action => {
      emitter.off(action, callback);
    });
  };

  const emit = (action: string): void => {
    emitter.emit(action);
  };

  return { on, onAll, off, offAll, emit };
};
