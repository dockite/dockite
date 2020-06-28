import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { GlobalContext } from '../../common/types';
import { getModules } from '../../utils';

import { createExtraGraphQLSchema } from './dockite';
import * as resolvers from './resolvers';

const log = debug('dockite:core:external');
const tlog = debug('dockite:core:external:timer');

// eslint-disable-next-line
export const getRegisteredExternalModules = (): Promise<any>[] => {
  return getModules('external');
};

export const ExternalGraphQLModule = async (): Promise<GraphQLModule<
  any,
  any,
  GlobalContext,
  any
>> => {
  tlog('starting');
  log('building type-definitions and resolvers');

  const resolverPromises = ((await Promise.all(
    Object.values(resolvers).map(r => Promise.resolve(r)),
  )) as any[]) as [Function, ...Function[]];

  const externalSchema = await buildTypeDefsAndResolvers({
    resolvers: resolverPromises,
    // authChecker,
  });

  log('collecting registered modules');
  const modules = await Promise.all(getRegisteredExternalModules());

  log('creating graphql schemas for content types');
  const schema = await createExtraGraphQLSchema();

  log('creating graphql module');
  tlog('ending');
  return new GraphQLModule({
    typeDefs: externalSchema.typeDefs,
    resolvers: externalSchema.resolvers,
    extraSchemas: [schema],
    imports: modules,
    context: (ctx): GlobalContext => ctx,
  });
};
