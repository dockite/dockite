import debug from 'debug';
import {
  Connection,
  createConnection as createDatabaseConnection,
  getConnection as getDatabaseConnection,
} from 'typeorm';

import {
  Document,
  DocumentRevision,
  Field,
  Locale,
  PasswordReset,
  Release,
  Role,
  Schema,
  SchemaRevision,
  SearchEngine,
  Singleton,
  User,
  Webhook,
  WebhookCall,
} from '@dockite/database';

import { getConfig } from '../common/config';
import { startTiming } from '../common/util';

import { DocumentSubscriber, FieldSubscriber, SchemaSubscriber } from './subscribers';
import { EntityLike, SubscriberLike } from './types';
import { loadExternalEntities } from './util';

const log = debug('dockite:core:database');

const CONNECTION_TYPE = 'postgres';

const DATABASE_ENTITIES: Array<EntityLike> = [
  Document,
  DocumentRevision,
  Field,
  Locale,
  PasswordReset,
  Release,
  Role,
  Schema,
  SchemaRevision,
  SearchEngine,
  Singleton,
  User,
  Webhook,
  WebhookCall,
];

const DATABASE_SUBSCRIBERS: Array<SubscriberLike> = [
  DocumentSubscriber,
  FieldSubscriber,
  SchemaSubscriber,
];

/**
 * Attempts to retrieve the current database connection returning null
 * if a connection hasn't been established.
 */
export const getConnection = (): Connection | null => {
  try {
    return getDatabaseConnection();
  } catch (_) {
    return null;
  }
};

/**
 * Creates the database connection if it doesn't already exist.
 */
export const createConnection = async (): Promise<Connection> => {
  const elapsed = startTiming();

  const connection = getConnection();

  if (connection) {
    return connection;
  }

  const config = getConfig();

  const externalEntities = await loadExternalEntities(config);

  const conn = await createDatabaseConnection({
    type: CONNECTION_TYPE,

    host: config.database.host,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,

    port: config.database.port ?? 5432,
    ssl: config.database.ssl ?? false,

    synchronize: config.database.synchronize ?? true,

    subscribers: [...DATABASE_SUBSCRIBERS],
    entities: [...DATABASE_ENTITIES, ...externalEntities],

    logging: ['query', 'error'],
    logger: 'debug',

    extra: {
      max: config.database.maxPoolSize ?? 10,
      idleTimeoutMillis: 0,
    },
  });

  log(`established database connection in ${elapsed()} milliseconds`);

  return conn;
};

/**
 * Closes the database connection if one exists.
 */
export const closeConnection = async (): Promise<void> => {
  const connection = getConnection();

  if (connection) {
    await connection.close();
  }
};
