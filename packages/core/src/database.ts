import { Connection, createConnection } from 'typeorm';

import { getConfig } from './config';
import * as entities from './entities';
import { getenv } from './utils';

const useSSL = (): boolean => {
  return getenv('PG_SSL', 'false').toLowerCase() === 'true';
};

const config = getConfig();

export const connect = async (): Promise<Connection> => {
  let externalEntities: any[] = []; // eslint-disable-line

  if (config.entities && config.entities.length > 0) {
    externalEntities = await Promise.all(config.entities.map(x => import(x)));
  }

  const connection = await createConnection({
    type: 'postgres',
    host: getenv('PG_HOST', 'localhost'),
    username: getenv('PG_USERNAME', 'dockite'),
    password: getenv('PG_PASSWORD', 'password'),
    database: getenv('PG_DATABASE', 'dockite'),
    ssl: useSSL(),
    synchronize: true,
    entities: [...Object.values(entities), ...externalEntities],
  });

  return connection;
};
