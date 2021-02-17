import gql from 'graphql-tag';

import { Schema, Document } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export interface AllSchemasQueryResponse {
  allSchemas: FindManyResult<Schema>;
}

export const ALL_SCHEMAS_QUERY = gql`
  query {
    allSchemas {
      results {
        id
        name
        title
        type
        groups
        settings
        createdAt
        updatedAt
      }
      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
`;

export interface SearchDocumentsQueryResponse {
  searchDocuments: FindManyResult<Document>;
}

export const SEARCH_DOCUMENTS_QUERY = gql`
  query SearchDocumentsBySchemaIds(
    $schemaIds: [String!]
    $page: Int = 1
    $perPage: Int = 20
    $term: String!
    $where: WhereBuilderInputType
  ) {
    searchDocuments(
      schemaIds: $schemaIds
      page: $page
      perPage: $perPage
      term: $term
      where: $where
    ) {
      results {
        id
        locale
        data
        publishedAt
        createdAt
        updatedAt
        releaseId
        schemaId
        schema {
          id
          name
          title
          type
          groups
          settings
          createdAt
          updatedAt
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;

export interface GetDocumentByIdQueryResponse {
  getDocument: Document;
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
      schema {
        id
        name
        title
        type
        groups
        settings
        createdAt
        updatedAt
      }
    }
  }
`;
