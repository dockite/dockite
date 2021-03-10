import cookieParser from 'cookie-parser';
import debug from 'debug';
import express from 'express';

import { getConfig } from './common/config';

const log = debug('dockite:core');

/**
 * Creates the express server containing the Dockite GraphQL API.
 */
export const createServer = async (): Promise<express.Express> => {
  // const config = getConfig();

  log('creating http server');

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // TODO: Grab the schemas and things

  return app;
};

export default createServer;
