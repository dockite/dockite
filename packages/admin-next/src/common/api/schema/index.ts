/* eslint-disable import/prefer-default-export */
import { StoreObject } from '@apollo/client/core';
import { cloneDeep, sortBy } from 'lodash';

import { Schema } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { CREATE_SCHEMA_EVENT, DELETE_SCHEMA_EVENT, UPDATE_SCHEMA_EVENT } from '~/common/events';
import { logE } from '~/common/logger';
import { BaseSchema } from '~/common/types';
import {
  CreateSchemaMutationResponse,
  CreateSchemaMutationVariables,
  CREATE_SCHEMA_MUTATION,
  DeleteSchemaMutationResponse,
  DeleteSchemaMutationVariables,
  DELETE_SCHEMA_MUTATION,
  FetchAllSchemasQueryResponse,
  FetchAllSchemasQueryVariables,
  FETCH_ALL_SCHEMAS_QUERY,
  GetSchemaByIdQueryResponse,
  GetSchemaByIdQueryVariables,
  GET_SCHEMA_BY_ID_QUERY,
  ImportSchemaMutationResponse,
  ImportSchemaMutationVariables,
  IMPORT_SCHEMA_MUTATION,
  PermanentDeleteSchemaMutationResponse,
  PermanentDeleteSchemaMutationVariables,
  PERMANENT_DELETE_SCHEMA_MUTATION,
  RestoreSchemaMutationResponse,
  RestoreSchemaMutationVariables,
  RESTORE_SCHEMA_MUTATION,
  UpdateSchemaMutationResponse,
  UpdateSchemaMutationVariables,
  UPDATE_SCHEMA_MUTATION,
} from '~/graphql';
import { useEvent } from '~/hooks';
import { useGraphQL } from '~/hooks/useGraphQL';
import { bustDocumentsBySchemaId, deleteFields } from '~/utils';

/**
 *
 */
export const getSchemaById = async (id: string, deleted = false): Promise<Schema> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetSchemaByIdQueryResponse,
    GetSchemaByIdQueryVariables
  >({
    query: GET_SCHEMA_BY_ID_QUERY,
    variables: { id, deleted },
  });

  if (result.data.getSchema === null) {
    throw new ApplicationError(
      `The schema with ID "${id}" could not be found. Did you perhaps mean to fetch a singleton?`,
      ApplicationErrorCode.SCHEMA_NOT_FOUND,
    );
  }

  return result.data.getSchema;
};

/**
 *
 */
export const fetchAllSchemasWithPagination = async (
  perPage: number = DOCKITE_PAGINATION_PER_PAGE,
  deleted = false,
): Promise<FindManyResult<Schema>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllSchemasQueryResponse,
    FetchAllSchemasQueryVariables
  >({
    query: FETCH_ALL_SCHEMAS_QUERY,
    variables: {
      perPage,
      deleted,
    },
  });

  // We clone the result due to it pointing at a read-only cache item.
  const clone = cloneDeep(result);

  clone.data.allSchemas.results = sortBy(clone.data.allSchemas.results, 'name');

  return clone.data.allSchemas;
};

/**
 *
 */
export const fetchAllSchemas = async (
  perPage: number = DOCKITE_PAGINATION_PER_PAGE,
  deleted = false,
): Promise<Schema[]> => {
  const result = await fetchAllSchemasWithPagination(perPage, deleted);

  return sortBy(result.results, 'name');
};

/**
 *
 */
export const createSchema = async (payload: BaseSchema): Promise<Schema> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      CreateSchemaMutationResponse,
      CreateSchemaMutationVariables
    >({
      mutation: CREATE_SCHEMA_MUTATION,
      variables: {
        input: {
          payload,
        },
      },

      // On Update we will also append the schema to our allSchemas query
      /**
       *
       */
      update: (store, { data: createSchemaData }) => {
        if (createSchemaData) {
          const { createSchema: schema } = createSchemaData;

          const data = store.readQuery<FetchAllSchemasQueryResponse>({
            query: FETCH_ALL_SCHEMAS_QUERY,
          });

          if (data) {
            data.allSchemas.results = [...data.allSchemas.results, schema];

            store.writeQuery({ query: FETCH_ALL_SCHEMAS_QUERY, data });
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

    emit(CREATE_SCHEMA_EVENT);

    return result.data.createSchema;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to create the Schema.',
      ApplicationErrorCode.CANT_CREATE_SCHEMA,
    );
  }
};

/**
 *
 */
export const updateSchema = async (payload: BaseSchema, id: string): Promise<Schema> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      UpdateSchemaMutationResponse,
      UpdateSchemaMutationVariables
    >({
      mutation: UPDATE_SCHEMA_MUTATION,
      variables: {
        input: {
          payload,
          id,
        },
      },

      // On Update we will also append the schema to our allSchemas query
      update: (store, { data: updateSchemaData }) => {
        if (updateSchemaData) {
          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'getSchema',
            broadcast: false,
          });

          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'allSchemas',
            broadcast: false,
          });

          store.modify({
            id: 'ROOT_QUERY',
            fields: {
              ...bustDocumentsBySchemaId(id),
            },
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

    emit(UPDATE_SCHEMA_EVENT);

    return result.data.updateSchema;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to update the Schema.',
      ApplicationErrorCode.CANT_CREATE_SCHEMA,
    );
  }
};

/**
 *
 */
export const importSchema = async (payload: BaseSchema, id?: string): Promise<Schema> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      ImportSchemaMutationResponse,
      ImportSchemaMutationVariables
    >({
      mutation: IMPORT_SCHEMA_MUTATION,
      variables: {
        input: {
          payload,
          id,
        },
      },

      // On Update we will also append the schema to our allSchemas query
      update: (store, { data: importSchemaData }) => {
        if (importSchemaData) {
          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'getSchema',
            broadcast: false,
          });

          store.evict({
            id: 'ROOT_QUERY',
            fieldName: 'allSchemas',
            broadcast: false,
          });

          if (id) {
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                ...bustDocumentsBySchemaId(id),
              },
              broadcast: false,
            });
          }

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

    emit(UPDATE_SCHEMA_EVENT);

    return result.data.importSchema;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to update the Schema.',
      ApplicationErrorCode.CANT_CREATE_SCHEMA,
    );
  }
};

/**
 *
 */
export const deleteSchema = async (payload: Schema): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      DeleteSchemaMutationResponse,
      DeleteSchemaMutationVariables
    >({
      mutation: DELETE_SCHEMA_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      // On Update we will also append the schema to our allSchemas query
      /**
       *
       */
      update: (store, { data: deleteSchemaData }) => {
        if (deleteSchemaData) {
          const { deleteSchema: success } = deleteSchemaData;

          if (success) {
            // Evict the current entry for the Schema from all known cache entries.
            store.evict({
              id: store.identify((payload as unknown) as StoreObject),
              broadcast: false,
            });

            // Remove any documents containing the schema from the cache
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                ...bustDocumentsBySchemaId(payload.id),
              },
              broadcast: false,
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

    emit(DELETE_SCHEMA_EVENT);

    return result.data.deleteSchema;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to delete the Schema.',
      ApplicationErrorCode.CANT_DELETE_SCHEMA,
    );
  }
};

/**
 *
 */
export const permanentlyDeleteSchema = async (payload: Schema): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      PermanentDeleteSchemaMutationResponse,
      PermanentDeleteSchemaMutationVariables
    >({
      mutation: PERMANENT_DELETE_SCHEMA_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      // On Update we will also append the schema to our allSchemas query
      /**
       *
       */
      update: (store, { data: permanentDeleteSchemaData }) => {
        if (permanentDeleteSchemaData) {
          const { permanentlyDeleteSchema: success } = permanentDeleteSchemaData;

          if (success) {
            // Evict the current entry for the Schema from all known cache entries.
            store.evict({
              id: store.identify((payload as unknown) as StoreObject),
              broadcast: false,
            });

            // Remove any documents containing the schema from the cache
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                ...bustDocumentsBySchemaId(payload.id),
              },
              broadcast: false,
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

    emit(DELETE_SCHEMA_EVENT);

    return result.data.permanentlyDeleteSchema;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to permanently delete the Schema.',
      ApplicationErrorCode.CANT_DELETE_SCHEMA,
    );
  }
};

/**
 *
 */
export const restoreSchema = async (payload: Schema): Promise<Schema> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      RestoreSchemaMutationResponse,
      RestoreSchemaMutationVariables
    >({
      mutation: RESTORE_SCHEMA_MUTATION,
      variables: {
        input: {
          id: payload.id,
        },
      },

      /**
       *
       */
      update: (store, { data: restoreSchemaData }) => {
        if (restoreSchemaData) {
          const { restoreSchema: schema } = restoreSchemaData;

          if (schema) {
            // Remove any items within the GraphQL cache that relate to our schema
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                ...deleteFields(
                  'allSchemas',
                  'getSchema',
                  'allDocuments',
                  'findDocuments',
                  'searchDocuments',
                ),
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

    emit(UPDATE_SCHEMA_EVENT);

    return result.data.restoreSchema;
  } catch (err) {
    logE(err);

    if (err instanceof ApplicationError) {
      throw err;
    }

    throw new ApplicationError(
      'An error occurred while attempting to restore the Schema.',
      ApplicationErrorCode.CANT_DELETE_SCHEMA,
    );
  }
};
