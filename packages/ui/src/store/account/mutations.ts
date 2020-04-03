import { User } from '@dockite/types';
import { MutationTree } from 'vuex';

import { AccountState } from './types';

export const mutations: MutationTree<AccountState> = {
  setAuthenticated(state, status: boolean) {
    state.authenticated = status;
  },

  setUser(state, user: User) {
    state.user = user;
  },
};
