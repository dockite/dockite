import { Document, Schema } from '@dockite/database';
import { FindManyResult } from '@dockite/types';
import gql from 'graphql-tag';

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

export interface FindReferenceOfDocumentsQueryResponse {
  referenceOfDocuments: FindManyResult<Document>;
}

// TODO: Deprecate this in favour of just using AllDocuments/FindDocuments with the WhereBuilder
export const FIND_REFERENCE_OF_DOCUMENTS_QUERY = gql`
  query FindReferenceOfDocuments(
    $documentId: String!
    $schemaId: String!
    $fieldName: String!
    $page: Int! = 1
    $perPage: Int! = 20
  ) {
    referenceOfDocuments: resolveReferenceOf(
      documentId: $documentId
      schemaId: $schemaId
      fieldName: $fieldName
      page: $page
      perPage: $perPage
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
      currentPage
      hasNextPage
      totalPages
    }
  }
`;
