/* eslint-disable import/prefer-default-export */
import { Singleton } from '@dockite/database';
import { sortBy } from 'lodash';

import { FindManyResult } from '@dockite/types';

import { DOCKITE_ITEMS_PER_PAGE } from '~/common/constants';
import {
  FetchAllSingletonsQueryResponse,
  FetchAllSingletonsQueryVariables,
  FETCH_ALL_SINGLETONS_QUERY,
  GetSingletonByIdQueryResponse,
  GetSingletonByIdQueryVariables,
  GET_SINGLETON_BY_ID_QUERY,
} from '~/graphql';
import { useGraphQL } from '~/hooks/useGraphQL';

export const getSingletonById = async (id: string): Promise<Singleton> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetSingletonByIdQueryResponse,
    GetSingletonByIdQueryVariables
  >({
    query: GET_SINGLETON_BY_ID_QUERY,
    variables: { id },
  });

  return result.data.getSingleton;
};

export const fetchAllSingletonsWithPagination = async (
  perPage: number = DOCKITE_ITEMS_PER_PAGE,
): Promise<FindManyResult<Singleton>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllSingletonsQueryResponse,
    FetchAllSingletonsQueryVariables
  >({
    query: FETCH_ALL_SINGLETONS_QUERY,
    variables: {
      perPage,
    },
  });

  result.data.allSingletons.results = sortBy(result.data.allSingletons.results, 'name');

  return result.data.allSingletons;
};

export const fetchAllSingletons = async (
  perPage: number = DOCKITE_ITEMS_PER_PAGE,
): Promise<Singleton[]> => {
  const result = await fetchAllSingletonsWithPagination(perPage);

  return sortBy(result.results, 'name');
};
