import { reactive, readonly } from 'vue';

import { useConfig } from '../useConfig';

import { ApplicationState, MutatorFn, MutatorSourceFn } from './types';

let state: ApplicationState | undefined;

const createState = (): ApplicationState => {
  const config = useConfig();

  return reactive({
    locale: {
      id: config.app.rootLocale?.id ?? 'en-AU',
      title: config.app.rootLocale?.title ?? 'Australia',
      icon: config.app.rootLocale?.icon ?? '🇦🇺',
    },
  });
};

/**
 *
 */
export const useState = (): ApplicationState => {
  if (!state) {
    state = createState();
  }

  return readonly(state);
};

/**
 *
 */
export const useMutation = <T>(mutator: MutatorSourceFn<T>): MutatorFn<T> => {
  if (!state) {
    state = createState();
  }

  return (payload: T) => mutator(state as ApplicationState, payload);
};

export default useState;
