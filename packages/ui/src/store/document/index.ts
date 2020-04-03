import { Module } from 'vuex';

import { actions } from './actions';
import { mutations } from './mutations';
import { DocumentState } from './types';

import { RootState } from '..';

export const namespace = 'document';

export const state: DocumentState = {
  documentId: null,
};

export const document: Module<DocumentState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
};
