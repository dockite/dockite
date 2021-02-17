import { Singleton } from '@dockite/database';
import gql from 'graphql-tag';

import { FindManyResult } from '@dockite/types';

export interface FetchAllSingletonsQueryResponse {
  allSingletons: FindManyResult<Singleton>;
}

export type FetchAllSingletonsQueryVariables = {
  perPage: number;
};

export const FETCH_ALL_SINGLETONS_QUERY = gql`
  query FetchAllSingletons {
    allSingletons {
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
      }
      totalItems
      totalPages
      currentPage
      hasNextPage
    }
  }
`;

export default FETCH_ALL_SINGLETONS_QUERY;
