// import { Worker } from 'worker_threads';
import { Server } from 'http';

import { ApolloServer } from 'apollo-server-express';
import debug from 'debug';
import express from 'express';

import { rootModule } from './modules';

const log = debug('dockite:core');

export const start = async (port = process.env.PORT || 3000): Promise<Server> => {
  // TODO: Implement once @types/node allows it
  // const worker = new Worker('./workers/release-bot.ts', {
  //   env: worker_threads.SHARE_ENV,
  // });

  const app = express();

  app.use(express.json());
  const server = new ApolloServer({
    schema: rootModule.schema,
    context: rootModule.context,
  });

  server.applyMiddleware({ app });

  return app.listen(port, () => log(`server now listening on ${port}`));
};
