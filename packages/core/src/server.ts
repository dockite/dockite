// import { Worker } from 'worker_threads';
import { Server } from 'http';

import { ApolloServer } from 'apollo-server-express';
import debug from 'debug';
import express from 'express';

import { RootModule } from './modules';
import { GRAPHQL_PATH } from './common/constants/core';
import { UserContext, SessionContext, GlobalContext } from './common/types';
import { verify, getenv } from './utils';

const log = debug('dockite:core');

export const start = async (port = process.env.PORT || 3000): Promise<Server> => {
  log('creating server');

  // TODO: Implement once @types/node allows it
  // log('registering release-bot worker');
  // const worker = new Worker('./workers/release-bot.ts', {
  //   env: worker_threads.SHARE_ENV,
  // });

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
