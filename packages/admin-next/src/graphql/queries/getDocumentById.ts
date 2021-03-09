import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';

export interface GetDocumentByIdQueryResponse {
  getDocument: Document;
}

export interface GetDocumentByIdQueryVariables {
  id: string;
}

export const GET_DOCUMENT_BY_ID_QUERY = gql`
  query GetDocumentById($id: String!) {
    getDocument(id: $id) {
      id
      locale
      data
      publishedAt
      createdAt
      updatedAt
      deletedAt
      releaseId
      schemaId
    }
  }
`;

export default GET_DOCUMENT_BY_ID_QUERY;
