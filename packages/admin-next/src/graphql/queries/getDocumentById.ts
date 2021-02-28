import gql from 'graphql-tag';

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
      releaseId
      schemaId
    }
  }
`;

export default GET_DOCUMENT_BY_ID_QUERY;
