import { GlobalContext } from '@dockite/types';
import { GraphQLModule } from '@graphql-modules/core';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { PresignResolver } from './resolver';

export const GRAPHQL_MODULE_ID = 'module-s3-presign';

export default async function(): Promise<GraphQLModule> {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [PresignResolver],
  });

  return new GraphQLModule({
    typeDefs,
    resolvers,
    context: (ctx: GlobalContext) => ctx,
  });
}

export * from './resolver';
