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

  setToken(_, token: string) {
    window.localStorage.setItem('auth_token', token);
  },

  removeToken() {
    window.localStorage.removeItem('auth_token');
  },
};
