import { Module } from 'vuex';

import { actions } from './actions';
import { mutations } from './mutations';
import { SchemaState } from './types';

import { RootState } from '..';

export const namespace = 'schema';

export const state: SchemaState = {
  schemaId: null,
};

export const account: Module<SchemaState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
};
