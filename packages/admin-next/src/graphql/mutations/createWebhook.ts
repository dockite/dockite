import { gql } from '@apollo/client/core';

import { Webhook } from '@dockite/database';

import { BaseWebhook } from '~/common/types';

export interface CreateWebhookMutationResponse {
  createWebhook: Webhook;
}

export interface CreateWebhookMutationVariables {
  input: BaseWebhook;
}

export const CREATE_WEBHOOK_MUTATION = gql`
  mutation CreateWebhook($input: CreateWebhookArgs!) {
    createWebhook(input: $input) {
      id
      name
      url
      method
      options
      createdAt
      updatedAt
    }
  }
`;
