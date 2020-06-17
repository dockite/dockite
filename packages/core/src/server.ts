// import { Worker } from 'worker_threads';
// import path from 'path';
import { Server } from 'http';

import { DockiteFieldStatic } from '@dockite/types';
import { SchemaManager, registerField, registerScopes } from '@dockite/manager';
import { ApolloServer } from 'apollo-server-express';
import debug from 'debug';
import express from 'express';
import { set } from 'lodash';

import { EXTERNAL_GRAPHQL_PATH, INTERNAL_GRAPHQL_PATH } from './common/constants/core';
import { GlobalContext, SessionContext, UserContext } from './common/types';
import { getConfig } from './config';
import { DockiteEvents } from './events';
import { RootModule } from './modules';
import { ExternalGraphQLModule } from './modules/external';
import { getenv, verify } from './utils';
import { scopes } from './common/scopes';

// import { InternalGraphQLModule } from './modules/internal';

const log = debug('dockite:core');

export const start = async (port = process.env.PORT || 3000): Promise<Server> => {
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

  // app.use('/admin', express.static(path.dirname(require.resolve('@dockite/ui'))));
  // app.all('/admin*', (_req, res) => res.sendFile(require.resolve('@dockite/ui')));

  log('collecting modules');
  const [root, external] = await Promise.all([RootModule(), ExternalGraphQLModule()]);

  SchemaManager.internalSchema = root.schema;
  SchemaManager.externalSchema = external.schema;

  log('creating servers');
  const internalServer = new ApolloServer({
    schema: root.schema,
    context: ({ req, res }: SessionContext): GlobalContext => {
      try {
        const authorization = req.headers.authorization || '';
        const bearerSplit = authorization.split('Bearer');
        const token = bearerSplit[bearerSplit.length - 1].trim();

        const user = verify<UserContext>(token, getenv('APP_SECRET', 'secret'));

        return { req, res, user };
      } catch {
        return { req, res, user: undefined };
      }
    },
    introspection: true,
    playground: true,
  });

  const externalServer = new ApolloServer({
    schema: external.schema,
    context: (ctx: SessionContext): SessionContext => ctx,
    introspection: true,
    playground: true,
  });

  log('attaching servers');
  internalServer.applyMiddleware({ app, path: `/${INTERNAL_GRAPHQL_PATH}` });
  externalServer.applyMiddleware({ app, path: `/${EXTERNAL_GRAPHQL_PATH}` });

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

  log(
    `access your graphql server from either http://localhost:${port}/${INTERNAL_GRAPHQL_PATH} or http://localhost:${port}/${INTERNAL_GRAPHQL_PATH}`,
  );

  return app.listen(port, () => log(`server now listening on ${port}`));
};
