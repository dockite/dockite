import { gql } from '@apollo/client/core';

import { WebhookCall } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export interface FetchAllWebhookCallsQueryResponse {
  allWebhookCalls: FindManyResult<WebhookCall>;
}

export interface FetchAllWebhookCallsQueryVariables {
  webhookId: string;
  page: number;
  perPage: number;
}

export const FETCH_ALL_WEBHOOK_CALLS_QUERY = gql`
  query FetchAllWebhookCalls($webhookId: String!, $page: Int = 1, $perPage: Int = 25) {
    allWebhookCalls(webhookId: $webhookId, page: $page, perPage: $perPage) {
      results {
        id
        success
        status
        request
        response
        executedAt
      }
      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
`;
