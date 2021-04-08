import { DocumentRevision } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { DOCKITE_PAGINGATION_PAGE, DOCKITE_PAGINATION_PER_PAGE } from '~/common/constants';
import {
  GetRevisionsForDocumentQueryResponse,
  GetRevisionsForDocumentQueryVariables,
  GET_REVISIONS_FOR_DOCUMENT_QUERY,
} from '~/graphql/queries';
import { useGraphQL } from '~/hooks';

/**
 *
 */
export const getRevisionsForDocumentWithPagination = async (
  documentId: string,
  page = DOCKITE_PAGINGATION_PAGE,
  perPage = DOCKITE_PAGINATION_PER_PAGE,
): Promise<FindManyResult<DocumentRevision>> => {
  const graphql = useGraphQL();

  const result = await graphql.executeQuery<
    GetRevisionsForDocumentQueryResponse,
    GetRevisionsForDocumentQueryVariables
  >({
    query: GET_REVISIONS_FOR_DOCUMENT_QUERY,
    variables: {
      documentId,
      page,
      perPage,
    },
  });

  return result.data.getRevisionsForDocument;
};

/**
 *
 */
export const getRevisionsForDocument = async (
  documentId: string,
  page = DOCKITE_PAGINGATION_PAGE,
  perPage = DOCKITE_PAGINATION_PER_PAGE,
): Promise<DocumentRevision[]> => {
  const revisions = await getRevisionsForDocumentWithPagination(documentId, page, perPage);

  return revisions.results;
};
