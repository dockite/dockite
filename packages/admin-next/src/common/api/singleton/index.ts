import { StoreObject } from '@apollo/client/utilities';
import { sortBy, cloneDeep } from 'lodash';

import { Document, Singleton } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import {
  CREATE_SINGLETON_EVENT,
  DELETE_SINGLETON_EVENT,
  UPDATE_SINGLETON_EVENT,
} from '~/common/events';
import { logE } from '~/common/logger';
import { BaseSchema } from '~/common/types';
import {
  CreateSingletonMutationResponse,
  CreateSingletonMutationVariables,
  CREATE_SINGLETON_MUTATION,
  DeleteSingletonMutationResponse,
  DeleteSingletonMutationVariables,
  DELETE_SINGLETON_MUTATION,
  FetchAllSingletonsQueryResponse,
  FetchAllSingletonsQueryVariables,
  FETCH_ALL_SINGLETONS_QUERY,
  GetSingletonByIdQueryResponse,
  GetSingletonByIdQueryVariables,
  GET_SINGLETON_BY_ID_QUERY,
  ImportSingletonMutationResponse,
  ImportSingletonMutationVariables,
  IMPORT_SINGLETON_MUTATION,
  PermanentDeleteSingletonMutationResponse,
  PermanentDeleteSingletonMutationVariables,
  PERMANENT_DELETE_SINGLETON_MUTATION,
  RestoreSingletonMutationResponse,
  RestoreSingletonMutationVariables,
  RESTORE_SINGLETON_MUTATION,
  UpdateSingletonMutationResponse,
  UpdateSingletonMutationVariables,
  UPDATE_SINGLETON_MUTATION,
} from '~/graphql';
import { useEvent } from '~/hooks';
import { useGraphQL } from '~/hooks/useGraphQL';

/**
 *
 */
export const getSingletonById = async (id: string, deleted = false): Promise<Singleton> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetSingletonByIdQueryResponse,
    GetSingletonByIdQueryVariables
  >({
    query: GET_SINGLETON_BY_ID_QUERY,
    variables: { id, deleted },
  });

  return result.data.getSingleton;
};

/**
 *
 */
export const fetchAllSingletonsWithPagination = async (
  perPage: number = DOCKITE_PAGINATION_PER_PAGE,
  deleted = false,
): Promise<FindManyResult<Singleton>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllSingletonsQueryResponse,
    FetchAllSingletonsQueryVariables
  >({
    query: FETCH_ALL_SINGLETONS_QUERY,
    variables: {
      perPage,
      deleted,
    },
  });

  // We clone the result due to it pointing at a read-only cache item.
  const clone = cloneDeep(result);

  clone.data.allSingletons.results = sortBy(clone.data.allSingletons.results, 'name');

  return clone.data.allSingletons;
};

/**
 *
 */
export const fetchAllSingletons = async (
  perPage: number = DOCKITE_PAGINATION_PER_PAGE,
  deleted = false,
): Promise<Singleton[]> => {
  const result = await fetchAllSingletonsWithPagination(perPage, deleted);

  return sortBy(result.results, 'name');
};

/**
 *
 */
export const createSingleton = async (payload: BaseSchema): Promise<Singleton> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      CreateSingletonMutationResponse,
      CreateSingletonMutationVariables
    >({
      mutation: CREATE_SINGLETON_MUTATION,
      variables: {
        input: { payload },
      },

      // On Update we will also append the schema to our allSingletons query
      update: (store, { data: createSingletonData }) => {
        if (createSingletonData) {
          const { createSingleton: schema } = createSingletonData;

          const data = store.readQuery<FetchAllSingletonsQueryResponse>({
            query: FETCH_ALL_SINGLETONS_QUERY,
          });

          if (data) {
            data.allSingletons.results = [...data.allSingletons.results, schema];

            store.writeQuery({ query: FETCH_ALL_SINGLETONS_QUERY, data });
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

    // Emit the singleton creation event so consumers can run any required callbacks
    emit(CREATE_SINGLETON_EVENT);

    return result.data.createSingleton;
  } catch (err) {
    logE(err);

    throw new ApplicationError(
      'An error occurred while attempting to create the Singleton.',
      ApplicationErrorCode.CANT_CREATE_SINGLETON,
    );
  }
};

/**
 *
 */
export const updateSingleton = async (payload: BaseSchema, id: string): Promise<Singleton> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      UpdateSingletonMutationResponse,
      UpdateSingletonMutationVariables
    >({
      mutation: UPDATE_SINGLETON_MUTATION,
      variables: {
        input: { payload, id },
      },

      // On Update we will also append the schema to our allSingletons query
      update: (store, { data: updateSingletonData }) => {
        if (updateSingletonData) {
          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'getSingleton',
            broadcast: false,
          });

          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'allSingletons',
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data) {
      throw new ApplicationError(
        'An unknown error occurred, please try again later.',
        ApplicationErrorCode.UNKNOWN_ERROR,
      );
    }

    // Emit the singleton creation event so consumers can run any required callbacks
    emit(UPDATE_SINGLETON_EVENT);

    return result.data.updateSingleton;
  } catch (err) {
    logE(err);

    throw new ApplicationError(
      'An error occurred while attempting to create the Singleton.',
      ApplicationErrorCode.CANT_CREATE_SINGLETON,
    );
  }
};

/**
 *
 */
export const importSingleton = async (payload: BaseSchema, id: string): Promise<Singleton> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      ImportSingletonMutationResponse,
      ImportSingletonMutationVariables
    >({
      mutation: IMPORT_SINGLETON_MUTATION,
      variables: {
        input: { payload, id },
      },

      // On Update we will also append the schema to our allSingletons query
      update: (store, { data: importSingletonData }) => {
        if (importSingletonData) {
          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'getSingleton',
            broadcast: false,
          });

          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'allSingletons',
            broadcast: false,
          });

          store.gc();
        }
      },
    });

    if (!result.data) {
      throw new ApplicationError(
        'An unknown error occurred, please try again later.',
        ApplicationErrorCode.UNKNOWN_ERROR,
      );
    }

    // Emit the singleton creation event so consumers can run any required callbacks
    emit(UPDATE_SINGLETON_EVENT);

    return result.data.importSingleton;
  } catch (err) {
    logE(err);

    throw new ApplicationError(
      'An error occurred while attempting to create the Singleton.',
      ApplicationErrorCode.CANT_CREATE_SINGLETON,
    );
  }
};

/**
 *
 */
export const deleteSingleton = async (payload: Singleton): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      DeleteSingletonMutationResponse,
      DeleteSingletonMutationVariables
    >({
      mutation: DELETE_SINGLETON_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      // On Update we will also append the schema to our allSingletons query
      update: (store, { data: createSingletonData }) => {
        if (createSingletonData) {
          const { deleteSingleton: success } = createSingletonData;

          if (success) {
            // Evict the current entry for the Singleton from all known cache entries.
            store.evict({
              id: store.identify((payload as unknown) as StoreObject),
              broadcast: false,
            });

            // Remove any documents containing the schema from the cache
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                findDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.schemaId !== payload.id),
                  };
                },

                searchDocuments: (
                  documents: FindManyResult<Document>,
                ): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.schemaId !== payload.id),
                  };
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

    emit(DELETE_SINGLETON_EVENT);

    return result.data.deleteSingleton;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to delete the Singleton.',
      ApplicationErrorCode.CANT_DELETE_SINGLETON,
    );
  }
};

/**
 *
 */
export const permanentlyDeleteSingleton = async (payload: Singleton): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      PermanentDeleteSingletonMutationResponse,
      PermanentDeleteSingletonMutationVariables
    >({
      mutation: PERMANENT_DELETE_SINGLETON_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      // On Update we will also append the schema to our allSingletons query
      update: (store, { data: permanentDeleteSingletonData }) => {
        if (permanentDeleteSingletonData) {
          const { permanentlyDeleteSingleton: success } = permanentDeleteSingletonData;

          if (success) {
            // Evict the current entry for the Singleton from all known cache entries.
            store.evict({
              id: store.identify((payload as unknown) as StoreObject),
              broadcast: false,
            });

            // Remove any documents containing the schema from the cache
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                findDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.schemaId !== payload.id),
                  };
                },

                searchDocuments: (
                  documents: FindManyResult<Document>,
                ): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.schemaId !== payload.id),
                  };
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

    emit(DELETE_SINGLETON_EVENT);

    return result.data.permanentlyDeleteSingleton;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to permanently delete the Singleton.',
      ApplicationErrorCode.CANT_DELETE_SINGLETON,
    );
  }
};

/**
 *
 */
export const restoreSingleton = async (payload: Singleton): Promise<Singleton> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      RestoreSingletonMutationResponse,
      RestoreSingletonMutationVariables
    >({
      mutation: RESTORE_SINGLETON_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      update: (store, { data: restoreSingletonData }) => {
        if (restoreSingletonData) {
          const { restoreSingleton: schema } = restoreSingletonData;

          if (schema) {
            // Remove any items within the GraphQL cache that relate to our schema
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                allSingletons: (_, details) => details.INVALIDATE,

                getSingleton: (_, details) => details.INVALIDATE,

                findDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.schemaId !== payload.id),
                  };
                },

                searchDocuments: (
                  documents: FindManyResult<Document>,
                ): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.schemaId !== payload.id),
                  };
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

    emit(UPDATE_SINGLETON_EVENT);

    return result.data.restoreSingleton;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to permanently delete the Singleton.',
      ApplicationErrorCode.CANT_DELETE_SCHEMA,
    );
  }
};
