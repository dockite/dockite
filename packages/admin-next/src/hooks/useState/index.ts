import { reactive, readonly } from 'vue';

import { useConfig } from '../useConfig';

import { ApplicationState } from './types';

let state: ApplicationState | undefined;

const createState = (): ApplicationState => {
  const config = useConfig();

  return reactive({
    locale: config.app.rootLocale,
  });
};

export const useState = (): readonly ApplicationState => {
  if (!state) {
    state = createState();
  }

  return readonly(state);
};

export default useState;
