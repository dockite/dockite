import { cloneDeep, defaultsDeep } from 'lodash';

import { Document } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import {
  GET_DOCUMENT_BY_ID_QUERY,
  GetDocumentByIdQueryResponse,
  GetDocumentByIdQueryVariables,
} from '~/graphql';
import {
  FetchAllDocumentsDefaultQueryVariables,
  FetchAllDocumentsQueryResponse,
  FetchAllDocumentsQueryVariables,
  FETCH_ALL_DOCUMENTS_QUERY,
} from '~/graphql/queries/fetchAllDocuments';
import {
  FetchDocumentsBySchemaIdDefaultQueryVariables,
  FetchDocumentsBySchemaIdQueryResponse,
  FetchDocumentsBySchemaIdQueryVariables,
  FETCH_DOCUMENTS_BY_SCHEMA_ID_QUERY,
} from '~/graphql/queries/fetchDocumentsBySchemaId';
import { useGraphQL } from '~/hooks';

export type FetchDocumentsBySchemaIdArgs = FetchDocumentsBySchemaIdQueryVariables;

/**
 *
 */
export const fetchDocumentsBySchemaIdWithPagination = async (
  payload: FetchDocumentsBySchemaIdArgs,
  deleted = false,
): Promise<FindManyResult<Document>> => {
  const args: FetchDocumentsBySchemaIdArgs = defaultsDeep(
    cloneDeep(payload),
    FetchDocumentsBySchemaIdDefaultQueryVariables,
  );

  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchDocumentsBySchemaIdQueryResponse,
    FetchDocumentsBySchemaIdQueryVariables
  >({
    query: FETCH_DOCUMENTS_BY_SCHEMA_ID_QUERY,
    variables: {
      ...args,
      deleted,
    },
  });

  return result.data.findDocuments;
};

/**
 *
 */
export const fetchDocumentsBySchemaId = async (
  payload: FetchDocumentsBySchemaIdArgs,
  deleted = false,
): Promise<Document[]> => {
  const args: FetchDocumentsBySchemaIdArgs = defaultsDeep(
    cloneDeep(payload),
    FetchDocumentsBySchemaIdDefaultQueryVariables,
  );

  const { results } = await fetchDocumentsBySchemaIdWithPagination({ ...args, deleted });

  return results;
};

export type FetchAllDocumentsArgs = FetchAllDocumentsQueryVariables;

/**
 *
 */
export const fetchAllDocumentsWithPagination = async (
  payload: FetchAllDocumentsArgs,
): Promise<FindManyResult<Document>> => {
  const args: FetchAllDocumentsArgs = defaultsDeep(
    cloneDeep(payload),
    FetchAllDocumentsDefaultQueryVariables,
  );

  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    FetchAllDocumentsQueryResponse,
    FetchAllDocumentsQueryVariables
  >({
    query: FETCH_ALL_DOCUMENTS_QUERY,
    variables: args,
  });

  return result.data.allDocuments;
};

/**
 *
 */
export const fetchAllDocuments = async (payload: FetchAllDocumentsArgs): Promise<Document[]> => {
  const args: FetchAllDocumentsArgs = defaultsDeep(
    cloneDeep(payload),
    FetchAllDocumentsDefaultQueryVariables,
  );

  const { results } = await fetchAllDocumentsWithPagination(args);

  return results;
};

/**
 *
 */
export const getDocumentById = async (payload: {
  id: string;
  locale: string;
}): Promise<Document> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetDocumentByIdQueryResponse,
    GetDocumentByIdQueryVariables
  >({
    query: GET_DOCUMENT_BY_ID_QUERY,
    variables: { id: payload.id, locale: payload.locale },
  });

  return result.data.getDocument;
};
