import { GraphQLModule } from '@graphql-modules/core';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { GlobalContext } from '@dockite/types';

import { DocumentResolver } from './resolvers';

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
    // We have to passthrough the context from the root module otherwise it will be lost.
    context: (ctx: GlobalContext) => ctx,
  });
};

export default createInternalGraphQLModule;
