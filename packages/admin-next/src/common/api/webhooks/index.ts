import { Webhook } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE, DOCKITE_PAGINGATION_PAGE } from '~/common/constants';
import {
  FetchAllWebhooksQueryResponse,
  FetchAllWebhooksQueryVariables,
  FETCH_ALL_WEBHOOKS_QUERY,
} from '~/graphql/queries/fetchAllWebhooks';
import {
  GetWebhookByIdQueryResponse,
  GetWebhookByIdQueryVariables,
  GET_WEBHOOK_BY_ID_QUERY,
} from '~/graphql/queries/getWebhookById';
import { useGraphQL } from '~/hooks';

/**
 *
 */
export const getWebhookById = async (id: string): Promise<Webhook> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetWebhookByIdQueryResponse,
    GetWebhookByIdQueryVariables
  >({
    query: GET_WEBHOOK_BY_ID_QUERY,
    variables: {
      id,
    },
  });

  return result.data.getWebhook;
};

/**
 *
 */
export const fetchAllWebhooksWithPagination = async (
  page = DOCKITE_PAGINGATION_PAGE,
  perPage = DOCKITE_PAGINATION_PER_PAGE,
): Promise<FindManyResult<Webhook>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllWebhooksQueryResponse,
    FetchAllWebhooksQueryVariables
  >({
    query: FETCH_ALL_WEBHOOKS_QUERY,
    variables: {
      page,
      perPage,
    },
  });

  return result.data.allWebhooks;
};

/**
 *
 */
export const fetchAllWebhooks = async (
  page = DOCKITE_PAGINGATION_PAGE,
  perPage = DOCKITE_PAGINATION_PER_PAGE,
): Promise<Webhook[]> => {
  const { results } = await fetchAllWebhooksWithPagination(page, perPage);

  return results;
};
