import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';

export interface UpdateDocumentMutationResponse {
  updateDocument: Document;
}

export interface UpdateDocumentMutationVariables {
  input: {
    id: string;
    data: Record<string, any>;
  };
}

export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($input: UpdateDocumentArgs!) {
    updateDocument(input: $input) {
      id
      locale
      data
      publishedAt
      createdAt
      updatedAt
      schemaId
      releaseId
      userId
    }
  }
`;
