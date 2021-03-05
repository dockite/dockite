import { noop } from 'lodash';

import { Document, Schema } from '@dockite/database';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { CREATE_DOCUMENT_EVENT } from '~/common/events';
import { logE } from '~/common/logger';
import { BaseDocument } from '~/common/types';
import {
  CreateDocumentMutationResponse,
  CreateDocumentMutationVariables,
  CREATE_DOCUMENT_MUTATION,
} from '~/graphql';
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

export const updateDocument = noop;
