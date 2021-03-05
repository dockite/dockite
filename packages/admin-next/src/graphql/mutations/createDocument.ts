import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';

export interface CreateDocumentMutationResponse {
  createDocument: Document;
}

export interface CreateDocumentMutationVariables {
  data: Record<string, any>;
  locale: string;
  schemaId: string;
}

export const CREATE_DOCUMENT_MUTATION = gql`
  mutation CreateDocument($schemaId: String!, $data: JSON!, $locale: String!) {
    createDocument(schemaId: $schemaId, data: $data, locale: $locale) {
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
