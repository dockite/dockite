import { Schema } from '@dockite/database';
import gql from 'graphql-tag';

import { FindManyResult } from '@dockite/types';

export interface FetchAllSchemasQueryResponse {
  allSchemas: FindManyResult<Schema>;
}

export type FetchAllSchemasQueryVariables = {
  perPage: number;
};

export const FETCH_ALL_SCHEMAS_QUERY = gql`
  query FetchAllSchemas {
    allSchemas {
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
      }
      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
`;

export default FETCH_ALL_SCHEMAS_QUERY;
