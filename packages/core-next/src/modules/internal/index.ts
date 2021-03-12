import { GraphQLModule } from '@graphql-modules/core';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { DocumentResolver } from './resolvers';

export const GRAPHQL_MODULE_ID = 'internal';

/**
 * Creates the internal graphql modules that will satisfy requests to the /dockite/graphql/internal
 * endpoint.
 */
export const createInternalGraphQLModule = async (): Promise<GraphQLModule> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [DocumentResolver],
    validate: false,
  });

  return new GraphQLModule({
    typeDefs,
    resolvers,
  });
};
