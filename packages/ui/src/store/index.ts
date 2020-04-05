import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';

import { account } from './account';
import { document } from './document';
import { schema } from './schema';

Vue.use(Vuex);

export interface RootState {
  version: string;
}

export const store: StoreOptions<RootState> = {
  state: {
    version: '1.0.0',
  },
  actions: {
    restoreFromLocal() {
      this.dispatch('account/restoreFromLocal');
    },
  },
  modules: {
    account,
    document,
    schema,
  },
};

export default new Vuex.Store<RootState>(store);
