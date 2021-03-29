import { StoreObject } from '@apollo/client/core';

import { Locale } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { MAX_32_BIT_INT } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import {
  CREATE_LOCALE_EVENT,
  DELETE_DOCUMENT_EVENT,
  DELETE_LOCALE_EVENT,
  UPDATE_LOCALE_EVENT,
} from '~/common/events';
import { logE } from '~/common/logger';
import {
  CreateLocaleMutationResponse,
  CreateLocaleMutationVariables,
  CREATE_LOCALE_MUTATION,
  DeleteLocaleMutationResponse,
  DeleteLocaleMutationVariables,
  DELETE_LOCALE_MUTATION,
  FetchAllLocalesQueryResponse,
  FetchAllLocalesQueryVariables,
  FETCH_ALL_LOCALES_QUERY,
  UpdateLocaleMutationResponse,
  UpdateLocaleMutationVariables,
  UPDATE_LOCALE_MUTATION,
} from '~/graphql';
import { useEvent, useGraphQL } from '~/hooks';

/**
 *
 */
export const fetchAllLocales = async (): Promise<Locale[]> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeQuery<
      FetchAllLocalesQueryResponse,
      FetchAllLocalesQueryVariables
    >({
      query: FETCH_ALL_LOCALES_QUERY,
      variables: {
        page: 1,
        perPage: MAX_32_BIT_INT,
      },
    });

    return result.data.allLocales.results;
  } catch (err) {
    logE(err);

    throw err;
  }
};

/**
 *
 */
export const createLocale = async (payload: Locale): Promise<Locale> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      CreateLocaleMutationResponse,
      CreateLocaleMutationVariables
    >({
      mutation: CREATE_LOCALE_MUTATION,
      variables: {
        input: {
          id: payload.id,
          title: payload.title,
          icon: payload.icon,
        },
      },

      update: (store, { data: createLocaleData }) => {
        if (createLocaleData) {
          const { createLocale: locale } = createLocaleData;

          store.modify({
            id: 'ROOT_QUERY',
            broadcast: false,
            fields: {
              allLocales: (locales: FindManyResult<Locale>): FindManyResult<Locale> => {
                return {
                  ...locales,
                  results: [...locales.results, locale],
                };
              },
            },
          });

          store.gc();
        }
      },
    });

    if (!result.data) {
      throw new Error('Unable to create locale');
    }

    emit(CREATE_LOCALE_EVENT);

    return result.data.createLocale;
  } catch (err) {
    logE(err);

    throw err;
  }
};

/**
 *
 */
export const updateLocale = async (payload: Locale): Promise<Locale> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      UpdateLocaleMutationResponse,
      UpdateLocaleMutationVariables
    >({
      mutation: UPDATE_LOCALE_MUTATION,
      variables: {
        input: {
          id: payload.id,
          title: payload.title,
          icon: payload.icon,
        },
      },
    });

    if (!result.data) {
      throw new Error('Unable to update locale');
    }

    emit(UPDATE_LOCALE_EVENT);

    return result.data.updateLocale;
  } catch (err) {
    logE(err);

    throw err;
  }
};

/**
 *
 */
export const deleteLocale = async (payload: Locale): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      DeleteLocaleMutationResponse,
      DeleteLocaleMutationVariables
    >({
      mutation: DELETE_LOCALE_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      update: (store, { data: deleteLocaleData }) => {
        if (deleteLocaleData) {
          const { deleteLocale: success } = deleteLocaleData;

          if (success) {
            // Evict the current entry for the Locale from all known cache entries.
            store.evict({
              id: store.identify((payload as unknown) as StoreObject),
              broadcast: false,
            });

            // Remove any documents containing the schema from the cache
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                getDocument: (_, details): any => {
                  return details.DELETE;
                },

                findDocuments: (_, details): any => {
                  return details.DELETE;
                },

                searchDocuments: (_, details): any => {
                  return details.DELETE;
                },

                allDocuments: (_, details): any => {
                  return details.DELETE;
                },
              },
            });

            store.gc();
          }
        }
      },
    });

    if (!result.data) {
      throw new ApplicationError(
        'An unknown error occurred, please try again later.',
        ApplicationErrorCode.UNKNOWN_ERROR,
      );
    }

    emit(DELETE_LOCALE_EVENT);
    emit(DELETE_DOCUMENT_EVENT);

    return result.data.deleteLocale;
  } catch (err) {
    logE(err);

    const e = graphql.exceptionHandler(err);

    if (e instanceof ApplicationError) {
      throw e;
    }

    throw new ApplicationError(
      'An unknown error has occurred, please try again later.',
      ApplicationErrorCode.UNKNOWN_ERROR,
    );
  }
};
