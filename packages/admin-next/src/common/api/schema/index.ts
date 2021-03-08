/* eslint-disable import/prefer-default-export */
import { StoreObject } from '@apollo/client/core';
import { cloneDeep, sortBy } from 'lodash';

import { Document, Schema } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_ITEMS_PER_PAGE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { CREATE_SCHEMA_EVENT, DELETE_SCHEMA_EVENT } from '~/common/events';
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
  PermanentDeleteSchemaMutationResponse,
  PermanentDeleteSchemaMutationVariables,
  PERMANENT_DELETE_SCHEMA_MUTATION,
} from '~/graphql';
import { useEvent } from '~/hooks';
import { useGraphQL } from '~/hooks/useGraphQL';

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

export const fetchAllSchemasWithPagination = async (
  perPage: number = DOCKITE_ITEMS_PER_PAGE,
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

export const fetchAllSchemas = async (
  perPage: number = DOCKITE_ITEMS_PER_PAGE,
  deleted = false,
): Promise<Schema[]> => {
  const result = await fetchAllSchemasWithPagination(perPage, deleted);

  return sortBy(result.results, 'name');
};

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
        payload,
      },

      // On Update we will also append the schema to our allSchemas query
      update: (store, { data: createSchemaData }) => {
        if (createSchemaData) {
          const { createSchema: schema } = createSchemaData;

          const data = store.readQuery<FetchAllSchemasQueryResponse>({
            query: FETCH_ALL_SCHEMAS_QUERY,
          });

          if (data) {
            data.allSchemas.results.push(schema);

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
        id: payload.id,
      },

      // On Update we will also append the schema to our allSchemas query
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

export const permanentDeleteSchema = async (payload: Schema): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      PermanentDeleteSchemaMutationResponse,
      PermanentDeleteSchemaMutationVariables
    >({
      mutation: PERMANENT_DELETE_SCHEMA_MUTATION,
      variables: {
        id: payload.id,
      },

      // On Update we will also append the schema to our allSchemas query
      update: (store, { data: permanentDeleteSchemaData }) => {
        if (permanentDeleteSchemaData) {
          const { permanentDeleteSchema: success } = permanentDeleteSchemaData;

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

    emit(DELETE_SCHEMA_EVENT);

    return result.data.permanentDeleteSchema;
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
