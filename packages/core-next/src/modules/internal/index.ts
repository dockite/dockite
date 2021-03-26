import { GraphQLModule } from '@graphql-modules/core';
import debug from 'debug';
import { buildTypeDefsAndResolvers } from 'type-graphql';

import { GlobalContext } from '@dockite/types';

import { startTiming } from '../../common/util';

import {
  DocumentResolver,
  FieldResolver,
  GeneralResolver,
  LocaleResolver,
  RevisionResolver,
  SchemaResolver,
  SingletonResolver,
  WebhookCallResolver,
  WebhookResolver,
} from './resolvers';
import { ReleaseResolver } from './resolvers/release';

const log = debug('dockite:core:internal');

/**
 * Creates the internal graphql modules that will satisfy requests to the /dockite/graphql/internal
 * endpoint.
 */
export const createInternalGraphQLModule = async (): Promise<GraphQLModule> => {
  const duration = startTiming();

  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [
      DocumentResolver,
      FieldResolver,
      GeneralResolver,
      LocaleResolver,
      ReleaseResolver,
      RevisionResolver,
      SchemaResolver,
      SingletonResolver,
      WebhookResolver,
      WebhookCallResolver,
    ],
    validate: false,
  });

  log(`typegraphql built in ${duration()} milliseconds`);

  return new GraphQLModule({
    typeDefs,
    resolvers,
    // We have to passthrough the context from the root module otherwise it will be lost.
    context: (ctx: GlobalContext) => ctx,
  });
};

export default createInternalGraphQLModule;
