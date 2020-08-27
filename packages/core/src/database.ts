import { Connection, createConnection } from 'typeorm';
import { entities } from '@dockite/database';
import debug from 'debug';

import { getConfig } from './config';
import * as subscribers from './subscribers';

const log = debug('dockite:core:db');

const config = getConfig();

let connection: Connection | null = null;

export const connect = async (): Promise<Connection> => {
  if (!connection) {
    let externalEntities: any[] = []; // eslint-disable-line

    log('collecting registered entities');
    if (config.entities && config.entities.length > 0) {
      externalEntities = await Promise.all(
        config.entities.map(x => import(x).then(i => Promise.resolve(i))),
      );
    }

    log('creating database connection');
    connection = await createConnection({
      type: 'postgres',
      host: config.database.host,
      username: config.database.username,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port,
      ssl: config.database.ssl ?? false,
      subscribers: Object.values(subscribers),
      synchronize: true,
      entities: [...Object.values(entities), ...externalEntities],
      logging: ['query', 'error'],
      logger: 'debug',
      extra: {
        max: config.database.maxPoolSize ?? 10,
        connectionTimeoutMillis: 1000,
      },
    });
  }

  return connection;
};
