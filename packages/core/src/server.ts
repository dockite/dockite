// import { Worker } from 'worker_threads';
import { Server } from 'http';

import { DockiteFieldStatic } from '@dockite/field';
import { ApolloServer } from 'apollo-server-express';
import debug from 'debug';
import express from 'express';
import { set } from 'lodash';
import { GraphQLSchema } from 'graphql';

import { GRAPHQL_PATH } from './common/constants/core';
import { GlobalContext, SessionContext, UserContext } from './common/types';
import { getConfig } from './config';
import { DockiteEvents } from './events';
import { registerField } from './fields';
import { RootModule } from './modules';
import { getenv, verify } from './utils';

const log = debug('dockite:core');

export const SchemaStore: { schema: null | GraphQLSchema } = {
  schema: null,
};

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

  const app = express();

  app.use(express.json());

  const root = await RootModule();
  SchemaStore.schema = root.schema;

  const server = new ApolloServer({
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

  server.applyMiddleware({ app, path: `/${GRAPHQL_PATH}` });

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
    const updated = await RootModule();

    SchemaStore.schema = updated.schema;

    // eslint-disable-next-line
    // @ts-ignore
    const derrivedData = await server.generateSchemaDerivedData(updated.schema);

    // Update the schema and derrived data.
    set(server, 'schema', updated.schema);
    set(server, 'schemaDerivedData', derrivedData);
  });

  log(`access your graphql server from http://localhost:${port}/${GRAPHQL_PATH}`);

  return app.listen(port, () => log(`server now listening on ${port}`));
};
