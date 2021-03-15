import { GraphQLModule } from '@graphql-modules/core';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import express from 'express';

import { getConfig } from './common/config';
import { createGlobalContext } from './common/contexts/global';
import { getBoolean } from './common/util';
import { createConnection } from './database';
import { registerDockiteFields } from './fields';
import { getGraphQLModules } from './modules';

const log = debug('dockite:core');

const createAndApplyInternalApolloServer = async (
  app: express.Application,
): Promise<ApolloServer> => {
  const modules = await getGraphQLModules();

  const { schema } = new GraphQLModule({
    imports: [modules.internal, modules.external, modules.authentication],
  });

  const apolloServer = new ApolloServer({
    schema,
    playground: true,
    introspection: true,
    tracing: getBoolean(process.env.ENABLE_APOLLO_TRACING),
    context: ctx => createGlobalContext(ctx, schema),
  });

  apolloServer.applyMiddleware({
    app,
    path: '/internal',
    cors: {
      origin: true,
      credentials: true,
      exposedHeaders: 'authorization',
    },
  });

  return apolloServer;
};

const createAndApplyExternalApolloServer = async (
  app: express.Application,
): Promise<ApolloServer> => {
  const modules = await getGraphQLModules();

  const { schema } = new GraphQLModule({
    imports: [modules.external],
  });

  const apolloServer = new ApolloServer({
    schema,
    playground: true,
    introspection: true,
    tracing: getBoolean(process.env.ENABLE_APOLLO_TRACING),
    context: ctx => createGlobalContext(ctx, schema),
  });

  apolloServer.applyMiddleware({
    app,
    path: '/external',
    cors: {
      origin: true,
      credentials: true,
      exposedHeaders: 'authorization',
    },
  });

  return apolloServer;
};

/**
 * Creates the express server containing the Dockite GraphQL API.
 */
export const createServer = async (): Promise<express.Express> => {
  const config = getConfig();

  await createConnection();

  log('creating http server');

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  await registerDockiteFields(config);

  const internalServer = await createAndApplyInternalApolloServer(app);
  const externalServer = await createAndApplyExternalApolloServer(app);

  return app;
};

export default createServer;
