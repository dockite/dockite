import { Module } from 'vuex';
import { RootState } from '..';
import { actions } from './actions';
import { mutations } from './mutations';
import { AccountState } from './types';

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
