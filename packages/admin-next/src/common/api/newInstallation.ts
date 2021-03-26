import { ApolloError } from '@apollo/client/core';

import { logE } from '../logger';

import { NewInstallationQueryResponse, NEW_INSTALLATION_QUERY } from '~/graphql';
import { useGraphQL } from '~/hooks/useGraphQL';

export const getNewInstallation = async (): Promise<boolean> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeQuery<NewInstallationQueryResponse>({
      query: NEW_INSTALLATION_QUERY,
    });

    return result.data.newInstallation;
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

export default getNewInstallation;
