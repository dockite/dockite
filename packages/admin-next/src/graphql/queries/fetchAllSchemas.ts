import { gql } from '@apollo/client/core';

import { Schema } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export interface FetchAllSchemasQueryResponse {
  allSchemas: FindManyResult<Schema>;
}

export type FetchAllSchemasQueryVariables = {
  perPage: number;
  deleted?: boolean;
};

export const FETCH_ALL_SCHEMAS_QUERY = gql`
  query FetchAllSchemas($deleted: Boolean = false) {
    allSchemas(deleted: $deleted) {
      results {
        id
        name
        title
        type
        groups
        settings
        fields {
          id
          name
          title
          description
          type
          settings
        }
        createdAt
        updatedAt
        deletedAt
      }
      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
`;

export default FETCH_ALL_SCHEMAS_QUERY;
