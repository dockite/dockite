import path from 'path';

import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { authChecker } from '../../common/authorizers';
import { GlobalContext } from '../../common/types';

import * as resolvers from './resolvers';

const log = debug('dockite:core:authentication');

const Module: GraphQLModule | null = null;

export const AuthenticationGraphQLModule = async (): Promise<GraphQLModule<
  any,
  any,
  GlobalContext,
  any
>> => {
  if (Module) {
    return Module;
  }

  log('building type-definitions and resolvers');
  const typeDefsAndResolvers = await buildTypeDefsAndResolvers({
    resolvers: await Promise.all(Object.values(resolvers).map(r => Promise.resolve(r))),
    authChecker,
    emitSchemaFile: path.join(__dirname, './schema.gql'),
  });

  log('creating graphql module');
  return new GraphQLModule({
    typeDefs: typeDefsAndResolvers.typeDefs,
    resolvers: typeDefsAndResolvers.resolvers,
    context: (ctx): GlobalContext => ctx,
  });
};
