import { Connection, createConnection } from 'typeorm';
import debug from 'debug';

import { getConfig } from './config';
import * as entities from './entities';
import { getenv } from './utils';

const log = debug('dockite:core:db');

const useSSL = (): boolean => {
  return ['t', 'true'].includes(getenv('PG_SSL', 'false').toLowerCase());
};

const config = getConfig();

export const connect = async (): Promise<Connection> => {
  let externalEntities: any[] = []; // eslint-disable-line

  log('collecting registered entities');
  if (config.entities && config.entities.length > 0) {
    externalEntities = await Promise.all(config.entities.map(x => import(x)));
  }

  log('creating database connection');
  const connection = await createConnection({
    type: 'postgres',
    host: getenv('PG_HOST', 'localhost'),
    username: getenv('PG_USERNAME', 'dockite'),
    password: getenv('PG_PASSWORD', 'password'),
    database: getenv('PG_DATABASE', 'dockite'),
    ssl: useSSL(),
    synchronize: true,
    entities: [...Object.values(entities), ...externalEntities],
    logging: ['query', 'error'],
    logger: 'debug',
  });

  return connection;
};
