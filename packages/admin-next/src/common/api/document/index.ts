import { StoreObject } from '@apollo/client/core';
import { noop } from 'lodash';

import { Document, Schema } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import {
  CREATE_DOCUMENT_EVENT,
  DELETE_DOCUMENT_EVENT,
  UPDATE_DOCUMENT_EVENT,
} from '~/common/events';
import { logE } from '~/common/logger';
import { BaseDocument } from '~/common/types';
import {
  CreateDocumentMutationResponse,
  CreateDocumentMutationVariables,
  CREATE_DOCUMENT_MUTATION,
  UpdateDocumentMutationResponse,
  UpdateDocumentMutationVariables,
  UPDATE_DOCUMENT_MUTATION,
} from '~/graphql';
import {
  DeleteDocumentMutationResponse,
  DeleteDocumentMutationVariables,
  DELETE_DOCUMENT_MUTATION,
} from '~/graphql/mutations/deleteDocument';
import { useEvent, useGraphQL } from '~/hooks';

export const createDocument = async (payload: BaseDocument, schema: Schema): Promise<Document> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      CreateDocumentMutationResponse,
      CreateDocumentMutationVariables
    >({
      mutation: CREATE_DOCUMENT_MUTATION,
      variables: {
        data: payload.data,
        locale: payload.locale,
        schemaId: schema.id,
      },
    });

    if (!result.data) {
      throw new ApplicationError(
        'An unknown error occurred, please try again later.',
        ApplicationErrorCode.UNKNOWN_ERROR,
      );
    }

    emit(CREATE_DOCUMENT_EVENT);

    return result.data.createDocument;
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

export const updateDocument = async (payload: Document): Promise<Document> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      UpdateDocumentMutationResponse,
      UpdateDocumentMutationVariables
    >({
      mutation: UPDATE_DOCUMENT_MUTATION,
      variables: {
        id: payload.id,
        data: payload.data,
      },
    });

    if (!result.data) {
      throw new ApplicationError(
        'An unknown error occurred, please try again later.',
        ApplicationErrorCode.UNKNOWN_ERROR,
      );
    }

    emit(UPDATE_DOCUMENT_EVENT);

    return result.data.updateDocument;
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

export const deleteDocument = async (payload: Document): Promise<boolean> => {
  const graphql = useGraphQL();
  const { emit } = useEvent();

  try {
    const result = await graphql.executeMutation<
      DeleteDocumentMutationResponse,
      DeleteDocumentMutationVariables
    >({
      mutation: DELETE_DOCUMENT_MUTATION,
      variables: {
        id: payload.id,
      },

      update: (store, { data: deleteDocumentData }) => {
        if (deleteDocumentData) {
          const { deleteDocument: success } = deleteDocumentData;

          if (success) {
            // Evict the current entry for the Document from all known cache entries.
            store.evict({
              id: store.identify((payload as unknown) as StoreObject),
              broadcast: false,
            });

            // Remove any documents containing the schema from the cache
            store.modify({
              id: 'ROOT_QUERY',
              fields: {
                get: (document: Document, details): Document | any => {
                  if (document.id === payload.id) {
                    return details.DELETE;
                  }

                  return document;
                },

                findDocuments: (documents: FindManyResult<Document>): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.id !== payload.id),
                  };
                },

                searchDocuments: (
                  documents: FindManyResult<Document>,
                ): FindManyResult<Document> => {
                  return {
                    ...documents,
                    results: documents.results.filter(document => document.id !== payload.id),
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

    emit(DELETE_DOCUMENT_EVENT);

    return result.data.deleteDocument;
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
