import { ApolloError } from '@apollo/client/core';

import { logE } from '../logger';

import {
  AvailableFieldItem,
  AvailableFieldsQueryResponse,
  AVAILABLE_FIELDS_QUERY,
} from '~/graphql';
import { useGraphQL } from '~/hooks/useGraphQL';

/**
 *
 */
export const getAvailableFields = async (): Promise<AvailableFieldItem[]> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeQuery<AvailableFieldsQueryResponse>({
      query: AVAILABLE_FIELDS_QUERY,
    });

    return result.data.availableFields;
  } catch (err) {
    if (err instanceof ApolloError) {
      const error = graphql.exceptionHandler(err);

      throw error;
    } else {
      logE(err);

      throw err;
    }
  }
};

export default getAvailableFields;
