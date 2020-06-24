// We need to disable eslint ordering for this file since
// we require dotenv to load before everything else
/* eslint-disable import/order,import/first */
import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { getConfig } from './config';
import { connect } from './database';
import { Express } from 'express';
import { start, createServer } from './server';

getConfig();

const startTime = Date.now();

export default connect().then(() =>
  start().then(() => console.log('Time taken', (Date.now() - startTime) / 1000, 'seconds')),
);

export const create = async (): Promise<Express> => {
  await connect();
  const app = await createServer();

  return app;
};
