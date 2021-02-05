import { Schema, Document } from '@dockite/database';
import gql from 'graphql-tag';

export interface AllSchemasQueryResponse {
  allSchemas: {
    results: Schema[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };
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
  searchDocuments: {
    results: Document[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
  };
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
        data
        updatedAt
        schema {
          id
          name
        }
      }
      totalItems
      totalPages
      currentPage
    }
  }
`;
