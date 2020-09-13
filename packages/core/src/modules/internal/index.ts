import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { authChecker } from '../../common/decorators';
import { getModules } from '../../utils';
import { GlobalContext } from '../../common/types';

import * as resolvers from './resolvers';

const log = debug('dockite:core:internal');

export const getRegisteredInternalModules = (): Promise<any>[] => {
  return getModules('internal');
};

export const InternalGraphQLModule = async (): Promise<GraphQLModule<
  any,
  any,
  GlobalContext,
  any
>> => {
  log('building type-definitions and resolvers');

  const resolverPromises = ((await Promise.all(
    Object.values(resolvers).map(r => Promise.resolve(r)),
  )) as any[]) as [Function, ...Function[]];

  const typeDefsAndResolvers = await buildTypeDefsAndResolvers({
    authChecker,
    resolvers: resolverPromises,
  });

  log('collecting registered modules');
  const modules = await Promise.all(getRegisteredInternalModules());

  log('creating graphql module');
  return new GraphQLModule({
    typeDefs: typeDefsAndResolvers.typeDefs,
    resolvers: typeDefsAndResolvers.resolvers,
    imports: modules,
    context: (ctx): GlobalContext => ctx,
  });
};
