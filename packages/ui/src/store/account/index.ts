import { Module } from 'vuex';

import { actions } from './actions';
import { mutations } from './mutations';
import { AccountState } from './types';

import { RootState } from '..';

export const namespace = 'account';

export const state: AccountState = {
  authenticated: false,
  user: null,
};

export const account: Module<AccountState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
};
