// We need to disable eslint ordering for this file since
// we require dotenv to load before everything else
/* eslint-disable import/order,import/first */
import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { getConfig } from './config';
import * as database from './database';
import { Express } from 'express';
import { start, createServer } from './server';

getConfig();

export { database };

export const serve = (): Promise<void> => {
  const startTime = Date.now();

  return database
    .connect()
    .then(() =>
      start().then(() => console.log('Time taken', (Date.now() - startTime) / 1000, 'seconds')),
    );
};

export default ((): void => {
  if (typeof module !== 'undefined' && !module.parent) {
    serve();
  }
})();

export const create = async (): Promise<Express> => {
  await database.connect();
  const app = await createServer();

  return app;
};
