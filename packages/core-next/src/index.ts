// eslint-disable-next-line
import { Server as HTTPServer } from 'http';
import debug from 'debug';
import dotenv from 'dotenv';

import 'reflect-metadata';
// TODO: Think about the pathing for this one
import * as config from './common/config';
import { startTiming } from './common/util';
import * as database from './database';
import { createServer } from './server';

dotenv.config();

const log = debug('dockite:core');

/**
 * Creates the application and runs the HTTP server to handle incoming requests
 */
export const serve = async (): Promise<HTTPServer> => {
  const elapsed = startTiming();

  log('bootstrapping dockite');

  const server = await createServer();

  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || 'localhost';

  return server.listen(port, host, () => {
    log(`server now listening on http://${host}:${port}`);

    log(`dockite ready in ${elapsed()} milliseconds`);
  });
};

export const create = createServer;

/**
 * Serves the application if it is the root module.
 *
 * This is particularly useful when running the application in development mode.
 */
export const serveIfRoot = (): Promise<HTTPServer | void> => {
  // Handles NodeJS < 14.6.0
  if (typeof 'module' !== 'undefined' && !module.parent) {
    return serve();
  }

  // Handles NodeJS >= 14.6.0
  if (typeof require !== 'undefined' && require.main && require.main.path === __filename) {
    return serve();
  }

  return Promise.resolve();
};

export { config, database };

export default serveIfRoot();