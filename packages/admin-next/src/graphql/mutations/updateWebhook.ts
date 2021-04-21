import { gql } from '@apollo/client/core';

import { Webhook } from '@dockite/database';

export interface UpdateWebhookMutationResponse {
  updateWebhook: Webhook;
}

export interface UpdateWebhookMutationVariables {
  input: Omit<Webhook, 'createdAt' | 'updatedAt' | 'calls'>;
}

export const UPDATE_WEBHOOK_MUTATION = gql`
  mutation UpdateWebhook($input: UpdateWebhookArgs!) {
    updateWebhook(input: $input) {
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
