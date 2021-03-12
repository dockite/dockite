import { createModule, gql, Module as GraphQLModule } from 'graphql-modules';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { PresignResolver } from './resolver';

export const GRAPHQL_MODULE_ID = 'module-s3-presign';

export default async function(): Promise<GraphQLModule> {
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [PresignResolver],
  });

  return createModule({
    id: GRAPHQL_MODULE_ID,
    typeDefs: gql(typeDefs),
    resolvers,
  });
}

export * from './resolver';
