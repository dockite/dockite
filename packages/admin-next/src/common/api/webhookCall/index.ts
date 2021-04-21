import { WebhookCall } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE, DOCKITE_PAGINGATION_PAGE } from '~/common/constants';
import {
  FetchAllWebhookCallsQueryResponse,
  FetchAllWebhookCallsQueryVariables,
  FETCH_ALL_WEBHOOK_CALLS_QUERY,
} from '~/graphql';
import { useGraphQL } from '~/hooks';

/**
 *
 */
export const fetchAllWebhookCallsForWebhookWithPagination = async (
  id: string,
  page = DOCKITE_PAGINGATION_PAGE,
  perPage = DOCKITE_PAGINATION_PER_PAGE,
): Promise<FindManyResult<WebhookCall>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllWebhookCallsQueryResponse,
    FetchAllWebhookCallsQueryVariables
  >({
    query: FETCH_ALL_WEBHOOK_CALLS_QUERY,

    variables: {
      webhookId: id,
      page,
      perPage,
    },
  });

  return result.data.allWebhookCalls;
};

/**
 *
 */
export const fetchAllWebhookCallsForWebhook = async (
  id: string,
  page = DOCKITE_PAGINGATION_PAGE,
  perPage = DOCKITE_PAGINATION_PER_PAGE,
): Promise<WebhookCall[]> => {
  const result = await fetchAllWebhookCallsForWebhookWithPagination(id, page, perPage);

  return result.results;
};
