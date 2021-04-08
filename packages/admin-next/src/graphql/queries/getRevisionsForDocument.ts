import { gql } from '@apollo/client/core';

import { DocumentRevision } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export interface GetRevisionsForDocumentQueryResponse {
  getRevisionsForDocument: FindManyResult<DocumentRevision>;
}

export interface GetRevisionsForDocumentQueryVariables {
  documentId: string;
  page?: number;
  perPage?: number;
}

export const GET_REVISIONS_FOR_DOCUMENT_QUERY = gql`
  query GetRevisionsForDocument($documentId: String!, $page: Int = 1, $perPage: Int = 20) {
    getRevisionsForDocument(documentId: $documentId, page: $page, perPage: $perPage) {
      results {
        id
        data
        documentId
        schemaId
        user {
          id
          firstName
          lastName
          email
        }
        userId
        createdAt
        updatedAt
      }

      totalItems
      currentPage
      totalPages
      hasNextPage
    }
  }
`;

export default GET_REVISIONS_FOR_DOCUMENT_QUERY;
