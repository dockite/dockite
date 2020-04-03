import { Module } from 'vuex';
import { RootState } from '..';
import { actions } from './actions';
import { mutations } from './mutations';
import { SchemaState } from './types';

export const namespace = 'schema';

export const state: SchemaState = {
  authenticated: false,
  user: null,
};

export const account: Module<SchemaState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
};
