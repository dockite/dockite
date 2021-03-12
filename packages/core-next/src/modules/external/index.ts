import { createModule, gql, Module as GraphQLModule } from 'graphql-modules';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { DocumentResolver } from './resolvers';

export const GRAPHQL_MODULE_ID = 'external';

/**
 * Creates the internal graphql modules that will satisfy requests to the /dockite/graphql/internal
 * endpoint.
 */
export const createExternalGraphQLModule = async (): Promise<GraphQLModule> => {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [DocumentResolver],
  });

  console.log({ external: { typeDefs, resolvers } });

  return createModule({
    id: GRAPHQL_MODULE_ID,
    typeDefs: gql(`extend ${typeDefs}`),
    resolvers,
  });
};
