import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';

export interface UpdateDocumentMutationResponse {
  updateDocument: Document;
}

export interface UpdateDocumentMutationVariables {
  id: string;
  data: Record<string, any>;
}

export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($id: String!, $data: JSON!) {
    updateDocument(id: $id, data: $data) {
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
