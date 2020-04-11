import path from 'path';

import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { authChecker } from '../../common/authorizers';
import { getModules } from '../../utils';
import { GlobalContext } from '../../common/types';

import * as resolvers from './resolvers';

const log = debug('dockite:core:internal');

// eslint-disable-next-line
export const getRegisteredInternalModules = (): any[] => {
  return getModules('internal');
};

export const InternalGraphQLModule = async (): Promise<GraphQLModule<
  any,
  any,
  GlobalContext,
  any
>> => {
  log('building type-definitions and resolvers');
  const typeDefsAndResolvers = await buildTypeDefsAndResolvers({
    authChecker,
    resolvers: await Promise.all(Object.values(resolvers).map(r => Promise.resolve(r))),
    emitSchemaFile: path.join(__dirname, './schema.gql'),
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
