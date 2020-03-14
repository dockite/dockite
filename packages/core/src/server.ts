// import { Worker } from 'worker_threads';
import { Server } from 'http';

import { ApolloServer } from 'apollo-server-express';
import debug from 'debug';
import express from 'express';
import { DockiteFieldStatic } from '@dockite/field';

import { RootModule } from './modules';
import { GRAPHQL_PATH } from './common/constants/core';
import { UserContext, SessionContext, GlobalContext } from './common/types';
import { verify, getenv } from './utils';
import { getConfig } from './config';
import { registerField } from './fields';

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

  const app = express();

  app.use(express.json());

  const root = await RootModule();

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
  log(`access your graphql server from http://localhost:${port}/${GRAPHQL_PATH}`);

  return app.listen(port, () => log(`server now listening on ${port}`));
};
