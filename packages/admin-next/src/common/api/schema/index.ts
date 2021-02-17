/* eslint-disable import/prefer-default-export */
import { Schema } from '@dockite/database';
import { sortBy } from 'lodash';

import { FindManyResult } from '@dockite/types';

import { DOCKITE_ITEMS_PER_PAGE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
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

  console.log(`getSchemaById(${id})`);

  const result = await graphql.executeQuery<
    GetSchemaByIdQueryResponse,
    GetSchemaByIdQueryVariables
  >({
    query: GET_SCHEMA_BY_ID_QUERY,
    variables: { id },
  });

  if (result.data.getSchema === null) {
    throw new ApplicationError(
      `The schema with ID "${id}" could not be found. Did you perhaps mean to fetch a singleton?`,
      ApplicationErrorCode.SCHEMA_NOT_FOUND,
    );
  }

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
