import { createModule, gql, Module as GraphQLModule } from 'graphql-modules';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { AuthenticationResolver } from './resolvers';

/**
 * The unique ID for the GraphQL Module.
 */
export const GRAPHQL_MODULE_ID = 'authentication';

/**
 * Creates the authentication graphql modules that will be used in conjuction with the `internal` module to
 * handle user authentication.
 */
export const createAuthenticationGraphQLModule = async (): Promise<GraphQLModule> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [AuthenticationResolver],
  });

  console.log({ authentication: { typeDefs, resolvers } });

  return createModule({
    id: GRAPHQL_MODULE_ID,
    typeDefs: gql(`extend ${typeDefs}`),
    resolvers,
  });
};
