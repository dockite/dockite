import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';

export interface GetDocumentByIdQueryResponse {
  getDocument: Document;
}

export interface GetDocumentByIdQueryVariables {
  id: string;
  locale?: string;
  fallbackLocale?: boolean;
  deleted?: boolean;
}

export const GET_DOCUMENT_BY_ID_QUERY = gql`
  query GetDocumentById(
    $id: String!
    $locale: String
    $fallbackLocale: Boolean = false
    $deleted: Boolean = false
  ) {
    getDocument(id: $id, locale: $locale, fallbackLocale: $fallbackLocale, deleted: $deleted) {
      id
      locale
      data
      publishedAt
      createdAt
      updatedAt
      deletedAt
      releaseId
      schemaId
      parentId
    }
  }
`;

export default GET_DOCUMENT_BY_ID_QUERY;
