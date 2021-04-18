import { User } from '@sentry/browser';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import {
  CREATE_API_KEY_MUTATION,
  CreateApiKeyMutationResponse,
  CreateApiKeyMutationVariables,
} from '~/graphql/mutations/createApiKey';
import {
  DeleteApiKeyMutationResponse,
  DeleteApiKeyMutationVariables,
  DELETE_API_KEY_MUTATION,
} from '~/graphql/mutations/deleteApiKey';
import { useGraphQL, useAuth } from '~/hooks';
import { deleteFields } from '~/utils';

/**
 *
 */
export const createApiKey = async (): Promise<void> => {
  const graphql = useGraphQL();

  const auth = useAuth();

  try {
    const result = await graphql.executeMutation<
      CreateApiKeyMutationResponse,
      CreateApiKeyMutationVariables
    >({
      mutation: CREATE_API_KEY_MUTATION,

      update: (store, { data: createApiKeyData }): void => {
        if (createApiKeyData && createApiKeyData.createApiKey) {
          store.modify({
            id: 'ROOT_QUERY',
            fields: deleteFields('me'),
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data?.createApiKey) {
      throw new Error('Unable to create api key');
    }

    await auth.handleRefreshUser();
  } catch (err) {
    logE(err);

    throw new ApplicationError(
      'Unable to create API Key',
      ApplicationErrorCode.CANT_CREATE_API_KEY,
    );
  }
};

/**
 *
 */
export const deleteApiKey = async (payload: string): Promise<void> => {
  const graphql = useGraphQL();

  const auth = useAuth();

  try {
    const result = await graphql.executeMutation<
      DeleteApiKeyMutationResponse,
      DeleteApiKeyMutationVariables
    >({
      mutation: DELETE_API_KEY_MUTATION,

      variables: {
        key: payload,
      },

      update: (store, { data: deleteApiKeyData }): void => {
        if (deleteApiKeyData && deleteApiKeyData.deleteApiKey) {
          store.modify({
            id: 'ROOT_QUERY',
            fields: deleteFields('me'),
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data?.deleteApiKey) {
      throw new Error('Unable to delete api key');
    }

    await auth.handleRefreshUser();
  } catch (err) {
    logE(err);

    throw new ApplicationError(
      'Unable to create API Key',
      ApplicationErrorCode.CANT_CREATE_API_KEY,
    );
  }
};
