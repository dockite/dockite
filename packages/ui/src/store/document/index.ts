import { Module } from 'vuex';
import { RootState } from '..';
import { actions } from './actions';
import { mutations } from './mutations';
import { DocumentState } from './types';

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
