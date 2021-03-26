import { gql } from '@apollo/client/core';

import { Document } from '@dockite/database';
import { DockiteGraphQLSortInput, FindManyResult } from '@dockite/types';
import { QueryBuilder } from '@dockite/where-builder/lib/types';

import { DOCKITE_PAGINATION_PER_PAGE } from '~/common/constants';

export interface FetchAllDocumentsQueryResponse {
  allDocuments: FindManyResult<Document>;
}

export type FetchAllDocumentsQueryVariables = {
  page?: number;
  perPage?: number;
  sort?: DockiteGraphQLSortInput;
  where?: QueryBuilder;
  deleted?: boolean;
};

export const FetchAllDocumentsDefaultQueryVariables: FetchAllDocumentsQueryVariables = {
  page: 1,
  perPage: DOCKITE_PAGINATION_PER_PAGE,
  deleted: false,
};

export const FETCH_ALL_DOCUMENTS_QUERY = gql`
  query FetchAllDocuments(
    $page: Int!
    $where: WhereBuilderInputType
    $sort: SortInputType
    $perPage: Int = 25
    $deleted: Boolean = false
  ) {
    allDocuments(page: $page, where: $where, sort: $sort, perPage: $perPage, deleted: $deleted) {
      results {
        id
        locale
        data
        publishedAt
        createdAt
        updatedAt
        deletedAt
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
          deletedAt
        }
      }
      totalItems
      currentPage
      totalPages
      hasNextPage
    }
  }
`;

export default FETCH_ALL_DOCUMENTS_QUERY;
