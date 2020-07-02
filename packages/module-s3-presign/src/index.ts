import { GraphQLModule } from '@graphql-modules/core';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { GlobalContext } from '@dockite/types';

import { PresignResolver } from './resolver';

export default async function(): Promise<GraphQLModule> {
  const typedefsAndResolvers = await buildTypeDefsAndResolvers({
    resolvers: [PresignResolver],
  });

  return new GraphQLModule({
    typeDefs: typedefsAndResolvers.typeDefs,
    resolvers: typedefsAndResolvers.resolvers,
    context: (ctx): GlobalContext => ctx,
  });
}
