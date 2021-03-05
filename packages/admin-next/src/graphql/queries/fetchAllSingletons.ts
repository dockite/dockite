import { gql } from '@apollo/client/core';

import { Singleton } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

export interface FetchAllSingletonsQueryResponse {
  allSingletons: FindManyResult<Singleton>;
}

export type FetchAllSingletonsQueryVariables = {
  perPage: number;
  deleted?: boolean;
};

export const FETCH_ALL_SINGLETONS_QUERY = gql`
  query FetchAllSingletons($deleted: Boolean = false) {
    allSingletons(deleted: $deleted) {
      results {
        id
        name
        title
        type
        groups
        settings
        data
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

export default FETCH_ALL_SINGLETONS_QUERY;
