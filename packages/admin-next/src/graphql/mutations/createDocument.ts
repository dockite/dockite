import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';

export interface CreateDocumentMutationResponse {
  createDocument: Document;
}

export interface CreateDocumentMutationVariables {
  input: {
    data: Record<string, any>;
    locale: string;
    schemaId: string;
  };
}

export const CREATE_DOCUMENT_MUTATION = gql`
  mutation CreateDocument($input: CreateDocumentArgs!) {
    createDocument(input: $input) {
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
