import { ApolloError } from '@apollo/client';

import { User } from '@dockite/database';

import { logE } from '../logger';

import { MeQueryResponse, ME_QUERY } from '~/graphql';
import { useGraphQL } from '~/hooks/useGraphQL';

export const getMe = async (): Promise<User> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeQuery<MeQueryResponse>({
      query: ME_QUERY,
    });

    return result.data.me;
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

export default getMe;
