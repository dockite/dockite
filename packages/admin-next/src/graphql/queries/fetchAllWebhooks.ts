import { gql } from '@apollo/client/core';

import { Webhook } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export interface FetchAllWebhooksQueryResponse {
  allWebhooks: FindManyResult<Webhook>;
}

export interface FetchAllWebhooksQueryVariables {
  page: number;
  perPage: number;
}

export const FETCH_ALL_WEBHOOKS_QUERY = gql`
  query FetchAllWebhooks($page: Int!, $perPage: Int = 25) {
    allWebhooks(page: $page, perPage: $perPage) {
      results {
        id
        name
        url
        method
        options
        createdAt
        updatedAt
      }
      totalItems
      currentPage
      totalPages
      hasNextPage
    }
  }
`;
