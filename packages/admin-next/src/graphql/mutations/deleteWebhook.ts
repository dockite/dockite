import { gql } from '@apollo/client/core';

export interface DeleteWebhookMutationResponse {
  deleteWebhook: boolean;
}

export interface DeleteWebhookMutationVariables {
  input: {
    id: string;
  };
}

export const DELETE_WEBHOOK_MUTATION = gql`
  mutation DeleteWebhook($input: DeleteWebhookArgs!) {
    deleteWebhook(input: $input)
  }
`;
