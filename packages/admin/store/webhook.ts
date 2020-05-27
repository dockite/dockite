import { ActionTree, GetterTree, MutationTree } from 'vuex';

import { RootState } from '.';

import {
  CreateWebhookMutationResponse,
  DeleteWebhookMutationResponse,
  UpdateWebhookMutationResponse,
} from '~/common/types';
import CreateWebhookMutation from '~/graphql/mutations/create-webhook.gql';
import DeleteWebhookMutation from '~/graphql/mutations/delete-document.gql';
import UpdateWebhookMutation from '~/graphql/mutations/update-document.gql';
import AllWebhooksQuery from '~/graphql/queries/all-webhooks.gql';

export interface WebhookState {
  errors: null | string | string[];
}

export interface CreateWebhookPayload {
  name: string;
  url: string;
  method: string;
  options: Record<string, any>;
}

export interface UpdateWebhookPayload extends CreateWebhookPayload {
  webhookId: string;
}

export interface DeleteWebhookPayload {
  webhookId: string;
}

export const namespace = 'webhook';

export const state = (): WebhookState => ({
  errors: null,
});

export const getters: GetterTree<WebhookState, RootState> = {};

export const actions: ActionTree<WebhookState, RootState> = {
  async createWebhook(_, payload: CreateWebhookPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<CreateWebhookMutationResponse>({
      mutation: CreateWebhookMutation,
      variables: {
        name: payload.name,
        url: payload.url,
        method: payload.method,
        options: payload.options,
      },
      refetchQueries: [{ query: AllWebhooksQuery }],
    });

    if (!data?.createWebhook) {
      throw new Error('Unable to create webhook');
    }
  },

  async updateWebhook(_, payload: UpdateWebhookPayload): Promise<void> {
    const { data: documentData } = await this.$apolloClient.mutate<UpdateWebhookMutationResponse>({
      mutation: UpdateWebhookMutation,
      variables: {
        id: payload.webhookId,
        name: payload.name,
        url: payload.url,
        method: payload.method,
        options: payload.options,
      },
      refetchQueries: [{ query: AllWebhooksQuery }],
    });

    if (!documentData?.updateWebhook) {
      throw new Error('Unable to update webhook');
    }
  },

  async deleteWebhook(_, payload: DeleteWebhookPayload): Promise<void> {
    const { data } = await this.$apolloClient.mutate<DeleteWebhookMutationResponse>({
      mutation: DeleteWebhookMutation,
      variables: {
        documentId: payload.webhookId,
      },
      refetchQueries: [{ query: AllWebhooksQuery }],
    });

    if (!data?.removeWebhook) {
      throw new Error('Unable to delete webhook');
    }
  },
};

export const mutations: MutationTree<WebhookState> = {
  setErrors(state, payload: string | string[]) {
    state.errors = payload;
  },

  clearErrors(state) {
    state.errors = null;
  },
};
