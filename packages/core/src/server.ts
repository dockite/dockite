// import { Worker } from 'worker_threads';
// import path from 'path';
import { Server } from 'http';

import { registerField, registerScopes, SchemaManager } from '@dockite/manager';
import { DockiteFieldStatic } from '@dockite/types';
import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import debug from 'debug';
import express, { Express } from 'express';
import { set } from 'lodash';

import { EXTERNAL_GRAPHQL_PATH, INTERNAL_GRAPHQL_PATH } from './common/constants/core';
import { scopes } from './common/scopes';
import { SessionContext } from './common/types';
import { getConfig } from './config';
import { DockiteEvents } from './events';
import { RootModule } from './modules';
import { ExternalGraphQLModule } from './modules/external';
import { createGlobalContext } from './utils';

// import { InternalGraphQLModule } from './modules/internal';

const log = debug('dockite:core');

export const createServer = async (): Promise<Express> => {
  log('creating server');

  // TODO: Implement once @types/node allows it
  // log('registering release-bot worker');
  // const worker = new Worker('./workers/release-bot.ts', {
  //   env: worker_threads.SHARE_ENV,
  // });

  log('loading fields');
  const config = getConfig();

  if (config.fields) {
    const importedFields = await Promise.all(config.fields.map(entry => import(entry)));

    importedFields.forEach(field => {
      Object.entries<DockiteFieldStatic>(field).forEach(([key, val]) => {
        registerField(key, val);
      });
    });
  }

  log('assigning scopes');
  registerScopes(...scopes);

  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  // app.use('/admin', express.static(path.dirname(require.resolve('@dockite/ui'))));
  // app.all('/admin*', (_req, res) => res.sendFile(require.resolve('@dockite/ui')));

  log('collecting modules');
  const [root, external] = await Promise.all([RootModule(), ExternalGraphQLModule()]);

  SchemaManager.internalSchema = root.schema;
  SchemaManager.externalSchema = external.schema;

  log('creating servers');
  const internalServer = new ApolloServer({
    schema: root.schema,
    context: createGlobalContext,
    introspection: true,
    playground: true,
    // tracing: true,
  });

  const externalServer = new ApolloServer({
    schema: external.schema,
    context: (ctx: SessionContext): SessionContext => ctx,
    introspection: true,
    playground: true,
    // tracing: true,
  });

  log('attaching servers');
  internalServer.applyMiddleware({
    app,
    path: `/${INTERNAL_GRAPHQL_PATH}`,
    cors: { origin: true, credentials: true },
  });
  externalServer.applyMiddleware({
    app,
    path: `/${EXTERNAL_GRAPHQL_PATH}`,
    cors: { origin: true, credentials: true },
  });

  /**
   * As bad as this is, it's the only way to hot-reload a
   * graphql schema without a full server restart.
   *
   * Once JS allows for native private methods this may break
   * however.
   */
  DockiteEvents.on('reload', async () => {
    log('reloading schema');
    // Load the RootModule again which
    // will load and compile all sub-modules.
    const [updatedInternalSchema, updatedExternalSchema] = await Promise.all([
      RootModule(),
      ExternalGraphQLModule(),
    ]);

    SchemaManager.internalSchema = updatedInternalSchema.schema;
    SchemaManager.externalSchema = updatedExternalSchema.schema;

    // We cast these two method calls to any since they're protected in their
    // corresponding type declarations. Without doing so we are unable to hot-patch
    // our schemas during runtime.
    const [internalDerrivedData, externalDerrivedData] = await Promise.all([
      (internalServer as any).generateSchemaDerivedData(updatedInternalSchema.schema),
      (externalServer as any).generateSchemaDerivedData(updatedExternalSchema.schema),
    ]);

    // Update the schema and derrived data.
    set(internalServer, 'schema', updatedInternalSchema.schema);
    set(internalServer, 'schemaDerivedData', internalDerrivedData);
    set(externalServer, 'schema', updatedExternalSchema.schema);
    set(externalServer, 'schemaDerivedData', externalDerrivedData);
  });

  return app;
};

export const start = async (port = process.env.PORT || 3000): Promise<Server> => {
  const app = await createServer();

  log(
    `access your graphql server from either http://localhost:${port}/${INTERNAL_GRAPHQL_PATH} or http://localhost:${port}/${INTERNAL_GRAPHQL_PATH}`,
  );

  return app.listen(port, () => log(`server now listening on ${port}`));
};
