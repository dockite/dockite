import { gql } from '@apollo/client/core';

import { Locale } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINATION_PER_PAGE, DOCKITE_PAGINGATION_PAGE } from '~/common/constants';

export interface FetchAllLocalesQueryResponse {
  allLocales: FindManyResult<Locale>;
}

export type FetchAllLocalesQueryVariables = {
  page?: number;
  perPage?: number;
};

export const FetchAllLocalesDefaultQueryVariables: FetchAllLocalesQueryVariables = {
  page: DOCKITE_PAGINGATION_PAGE,
  perPage: DOCKITE_PAGINATION_PER_PAGE,
};

export const FETCH_ALL_LOCALES_QUERY = gql`
  query FetchAllLocales($page: Int!, $perPage: Int = 25) {
    allLocales(page: $page, perPage: $perPage) {
      results {
        id
        title
        icon
      }
      totalItems
      currentPage
      totalPages
      hasNextPage
    }
  }
`;

export default FETCH_ALL_LOCALES_QUERY;
