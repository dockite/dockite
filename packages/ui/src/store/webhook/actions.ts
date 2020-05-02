import { apolloClient } from '@/apollo';
import gql from 'graphql-tag';
import { ActionTree } from 'vuex';

import { RootState } from '..';

import { CreateWebhookPayload, WebhookState } from './types';

export const actions: ActionTree<WebhookState, RootState> = {
  async create({ commit }, payload: CreateWebhookPayload) {
    const { data } = await apolloClient.mutate<{ createWebhook: { id: string } }>({
      mutation: gql`
        mutation CreateWebhookMutation(
          $name: String!
          $method: String!
          $url: String!
          $options: JSON!
        ) {
          createWebhook(name: $name, method: $method, url: $url, options: $options) {
            id
          }
        }
      `,
      variables: {
        ...payload,
      },
    });

    if (!data) throw new Error('Error creating webhook');

    const webhookId = data.createWebhook.id;

    commit('setWebhookId', webhookId);
  },

  // eslint-disable-next-line
  async update(_, payload: any) {
    // TODO
  },

  async delete({ commit }, webhookId: string) {
    await apolloClient.mutate({
      mutation: gql`
        mutation($id: String!) {
          removeWebhook(id: $id)
        }
      `,

      variables: { id: webhookId },
    });

    commit('setWebhookId', null);
  },
};
