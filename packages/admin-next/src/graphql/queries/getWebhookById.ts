import { gql } from '@apollo/client/core';

import { Webhook } from '@dockite/database';

export interface GetWebhookByIdQueryResponse {
  getWebhook: Webhook;
}

export interface GetWebhookByIdQueryVariables {
  id: string;
}

export const GET_WEBHOOK_BY_ID_QUERY = gql`
  query GetWebhookById($id: String!) {
    getWebhook(id: $id) {
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
