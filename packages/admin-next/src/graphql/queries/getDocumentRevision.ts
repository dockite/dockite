import { gql } from '@apollo/client/core';

import { DocumentRevision } from '@dockite/database';

export interface GetDocumentRevisionQueryResponse {
  getDocumentRevision: DocumentRevision;
}

export interface GetDocumentRevisionQueryVariables {
  documentId: string;
  revisionId: string;
}

export const GET_DOCUMENT_REVISION_QUERY = gql`
  query GetDocumentRevision($documentId: String!, $revisionId: String!) {
    getDocumentRevision(documentId: $documentId, revisionId: $revisionId) {
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
  }
`;

export default GET_DOCUMENT_REVISION_QUERY;
