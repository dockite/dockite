import { GraphQLModule } from '@graphql-modules/core';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { AuthenticationResolver } from './resolvers';

/**
 * Creates the authentication graphql modules that will be used in conjuction with the `internal` module to
 * handle user authentication.
 */
export const createAuthenticationGraphQLModule = async (): Promise<GraphQLModule> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [AuthenticationResolver],
    validate: false,
  });

  return new GraphQLModule({
    typeDefs,
    resolvers,
  });
};

export default createAuthenticationGraphQLModule;
