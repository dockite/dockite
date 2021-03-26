import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';
import { DockiteGraphQLSortInput, FindManyResult } from '@dockite/types';
import { QueryBuilder } from '@dockite/where-builder/lib/types';

import { DOCKITE_PAGINATION_PER_PAGE } from '~/common/constants';

export interface FetchDocumentsBySchemaIdQueryResponse {
  findDocuments: FindManyResult<Document>;
}

export type FetchDocumentsBySchemaIdQueryVariables = {
  schemaId: string;
  page?: number;
  perPage?: number;
  sort?: DockiteGraphQLSortInput;
  where?: QueryBuilder;
  deleted?: boolean;
};

export const FetchDocumentsBySchemaIdDefaultQueryVariables: Omit<
  FetchDocumentsBySchemaIdQueryVariables,
  'schemaId'
> = {
  page: 1,
  perPage: DOCKITE_PAGINATION_PER_PAGE,
  deleted: false,
};

export const FETCH_DOCUMENTS_BY_SCHEMA_ID_QUERY = gql`
  query FetchDocumentsBySchemaId(
    $schemaId: String!
    $page: Int!
    $where: WhereBuilderInputType
    $sort: SortInputType
    $perPage: Int = 25
    $deleted: Boolean = false
  ) {
    findDocuments(
      schemaId: $schemaId
      page: $page
      where: $where
      sort: $sort
      perPage: $perPage
      deleted: $deleted
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
      currentPage
      totalPages
      hasNextPage
    }
  }
`;

export default FETCH_DOCUMENTS_BY_SCHEMA_ID_QUERY;
