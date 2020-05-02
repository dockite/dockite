import { MutationTree } from 'vuex';

import { WebhookState } from './types';

export const mutations: MutationTree<WebhookState> = {
  setWebhookId(state, webhookId: string) {
    state.webhookId = webhookId;
  },
};
