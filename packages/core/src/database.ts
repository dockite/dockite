import { Connection, createConnection } from 'typeorm';

import * as entities from './entities';
import { getenv } from './utils';

const useSSL = (): boolean => {
  return getenv('PG_SSL', 'false').toLowerCase() === 'true';
};

export const connect = async (): Promise<Connection> => {
  const connection = await createConnection({
    type: 'postgres',
    host: getenv('PG_HOST', 'localhost'),
    username: getenv('PG_USERNAME', 'dockite'),
    password: getenv('PG_PASSWORD', 'password'),
    database: getenv('PG_DATABASE', 'dockite'),
    ssl: useSSL(),
    synchronize: true,
    entities: Object.values(entities),
  });

  return connection;
};
