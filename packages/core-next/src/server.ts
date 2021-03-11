import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import express from 'express';
import { createApplication } from 'graphql-modules';

import { createConnection } from './database';
import { getGraphQLModules } from './modules';

const log = debug('dockite:core');

const createAndApplyInternalApolloServer = async (
  app: express.Application,
): Promise<ApolloServer> => {
  const modules = await getGraphQLModules();

  const { schema } = createApplication({
    modules: [modules.internal, modules.external, modules.authentication],
  });

  const apolloServer = new ApolloServer({
    schema,
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

  const { schema } = createApplication({
    modules: [modules.external],
  });

  const apolloServer = new ApolloServer({
    schema,
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
  // const config = getConfig();

  await createConnection();

  log('creating http server');

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  const [internalServer, externalServer] = await Promise.all([
    createAndApplyInternalApolloServer(app),
    createAndApplyExternalApolloServer(app),
  ]);

  return app;
};

export default createServer;
