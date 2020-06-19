import path from 'path';

import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { authChecker } from '../../common/decorators';
import { GlobalContext } from '../../common/types';

import * as resolvers from './resolvers';

const log = debug('dockite:core:authentication');
const tlog = debug('dockite:core:authentication:timer');

const Module: GraphQLModule | null = null;

export const AuthenticationGraphQLModule = async (): Promise<GraphQLModule<
  any,
  any,
  GlobalContext,
  any
>> => {
  tlog('starting');
  if (Module) {
    return Module;
  }

  const resolverPromises = ((await Promise.all(
    Object.values(resolvers).map(r => Promise.resolve(r)),
  )) as any[]) as [Function, ...Function[]];

  log('building type-definitions and resolvers');
  const typeDefsAndResolvers = await buildTypeDefsAndResolvers({
    resolvers: resolverPromises,
    authChecker,
    emitSchemaFile: path.join(__dirname, './schema.gql'),
  });

  log('creating graphql module');
  tlog('ending');
  return new GraphQLModule({
    typeDefs: typeDefsAndResolvers.typeDefs,
    resolvers: typeDefsAndResolvers.resolvers,
    context: (ctx): GlobalContext => ctx,
  });
};
