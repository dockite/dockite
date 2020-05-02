import { Module } from 'vuex';

import { RootState } from '..';

import { actions } from './actions';
import { mutations } from './mutations';
import { WebhookState } from './types';

export const namespace = 'webhook';

export const state: WebhookState = {
  webhookId: null,
};

export const webhook: Module<WebhookState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
};
