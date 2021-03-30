/* eslint-disable class-methods-use-this */
import { App, reactive, readonly } from 'vue';
import { useLocalStorage } from 'vue-composable';

import { ApplicationState, MutatorFn, MutatorSourceFn } from './types';

import { getRootLocale } from '~/utils';

let state: ApplicationState | undefined;

const createState = (): ApplicationState => {
  const defaultLocale = getRootLocale();

  const { storage: localeStorage } = useLocalStorage('currentLocale', defaultLocale, true);

  return reactive({
    locale: localeStorage,
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

/**
 *
 */
export class DockiteStatePlugin {
  public install(app: App): void {
    app.provide('$state', useState());
  }
}

export default useState;
