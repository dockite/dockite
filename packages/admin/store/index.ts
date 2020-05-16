import { ActionTree } from 'vuex';

import * as auth from './auth';

export interface RootState {
  applicationName: 'dockite';
  initialized: boolean;
}

export const state = () => ({
  applicationName: 'dockite',
  initialized: false,
});

export const actions: ActionTree<RootState, RootState> = {
  async init() {
    await this.dispatch(`${auth.namespace}/init`);
  },
};
