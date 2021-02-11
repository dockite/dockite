/* eslint-disable import/prefer-default-export */
import { Schema } from '@dockite/database';
import { sortBy } from 'lodash';

import { FindManyResult } from '@dockite/types';

import { DOCKITE_ITEMS_PER_PAGE } from '~/common/constants';
import {
  FetchAllSchemasQueryResponse,
  FetchAllSchemasQueryVariables,
  FETCH_ALL_SCHEMAS_QUERY,
  GetSchemaByIdQueryResponse,
  GetSchemaByIdQueryVariables,
  GET_SCHEMA_BY_ID_QUERY,
} from '~/graphql';
import { useGraphQL } from '~/hooks/useGraphQL';

export const getSchemaById = async (id: string): Promise<Schema> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetSchemaByIdQueryResponse,
    GetSchemaByIdQueryVariables
  >({
    query: GET_SCHEMA_BY_ID_QUERY,
    variables: { id },
  });

  return result.data.getSchema;
};

export const fetchAllSchemasWithPagination = async (
  perPage: number = DOCKITE_ITEMS_PER_PAGE,
): Promise<FindManyResult<Schema>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllSchemasQueryResponse,
    FetchAllSchemasQueryVariables
  >({
    query: FETCH_ALL_SCHEMAS_QUERY,
    variables: {
      perPage,
    },
  });

  result.data.allSchemas.results = sortBy(result.data.allSchemas.results, 'name');

  return result.data.allSchemas;
};

export const fetchAllSchemas = async (
  perPage: number = DOCKITE_ITEMS_PER_PAGE,
): Promise<Schema[]> => {
  const result = await fetchAllSchemasWithPagination(perPage);

  return sortBy(result.results, 'name');
};
