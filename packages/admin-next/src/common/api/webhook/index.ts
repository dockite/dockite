import { Webhook } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE, DOCKITE_PAGINGATION_PAGE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { BaseWebhook } from '~/common/types';
import {
  CreateWebhookMutationResponse,
  CreateWebhookMutationVariables,
  CREATE_WEBHOOK_MUTATION,
  DeleteWebhookMutationResponse,
  DeleteWebhookMutationVariables,
  DELETE_WEBHOOK_MUTATION,
  UpdateWebhookMutationResponse,
  UpdateWebhookMutationVariables,
  UPDATE_WEBHOOK_MUTATION,
} from '~/graphql/mutations';
import {
  FetchAllWebhooksQueryResponse,
  FetchAllWebhooksQueryVariables,
  FETCH_ALL_WEBHOOKS_QUERY,
  GetWebhookByIdQueryResponse,
  GetWebhookByIdQueryVariables,
  GET_WEBHOOK_BY_ID_QUERY,
} from '~/graphql/queries';
import { useGraphQL } from '~/hooks';
import { deleteFields } from '~/utils';

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

/**
 *
 */
export const createWebhook = async (payload: BaseWebhook): Promise<Webhook> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeMutation<
      CreateWebhookMutationResponse,
      CreateWebhookMutationVariables
    >({
      mutation: CREATE_WEBHOOK_MUTATION,

      variables: {
        input: {
          name: payload.name,
          url: payload.url,
          method: payload.method,
          options: payload.options,
        },
      },

      update: (store, webhookCreateData) => {
        if (webhookCreateData.data?.createWebhook) {
          store.modify({
            id: 'ROOT_QUERY',
            fields: deleteFields('getWebhook', 'allWebhooks'),
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data?.createWebhook) {
      throw new Error('Unable to create webhook');
    }

    return result.data.createWebhook;
  } catch (err) {
    const e = graphql.exceptionHandler(err);

    if (e instanceof ApplicationError) {
      throw e;
    }

    logE(err);

    throw new ApplicationError(
      'An error occurred while attempting to create the webhook',
      ApplicationErrorCode.CANT_CREATE_WEBHOOK,
    );
  }
};

/**
 *
 */
export const updateWebhook = async (payload: Webhook): Promise<Webhook> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeMutation<
      UpdateWebhookMutationResponse,
      UpdateWebhookMutationVariables
    >({
      mutation: UPDATE_WEBHOOK_MUTATION,

      variables: {
        input: {
          id: payload.id,
          name: payload.name,
          url: payload.url,
          method: payload.method,
          options: payload.options,
        },
      },

      update: (store, webhookUpdateData) => {
        if (webhookUpdateData.data?.updateWebhook) {
          store.modify({
            id: 'ROOT_QUERY',
            fields: deleteFields('getWebhook', 'allWebhooks'),
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data?.updateWebhook) {
      throw new Error('Unable to update webhook');
    }

    return result.data.updateWebhook;
  } catch (err) {
    const e = graphql.exceptionHandler(err);

    if (e instanceof ApplicationError) {
      throw e;
    }

    logE(err);

    throw new ApplicationError(
      'An error occurred while attempting to update the webhook',
      ApplicationErrorCode.CANT_UPDATE_WEBHOOK,
    );
  }
};

/**
 *
 */
export const deleteWebhook = async (payload: string): Promise<boolean> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeMutation<
      DeleteWebhookMutationResponse,
      DeleteWebhookMutationVariables
    >({
      mutation: DELETE_WEBHOOK_MUTATION,

      variables: {
        input: {
          id: payload,
        },
      },

      update: (store, webhookDeleteData) => {
        if (webhookDeleteData.data?.deleteWebhook) {
          store.modify({
            id: 'ROOT_QUERY',
            fields: deleteFields('getWebhook', 'allWebhooks'),
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data?.deleteWebhook) {
      throw new Error('Unable to delete webhook');
    }

    return result.data.deleteWebhook;
  } catch (err) {
    const e = graphql.exceptionHandler(err);

    if (e instanceof ApplicationError) {
      throw e;
    }

    logE(err);

    throw new ApplicationError(
      'An error occurred while attempting to delete the webhook',
      ApplicationErrorCode.CANT_DELETE_WEBHOOK,
    );
  }
};
