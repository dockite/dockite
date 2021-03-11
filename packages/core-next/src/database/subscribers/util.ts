import { EntityManager, getManager } from 'typeorm';

import { Field, Schema } from '@dockite/database';
import { DockiteConfiguration } from '@dockite/types';

import { getConfig } from '../../common/config';
import { importModule } from '../../common/util';
import { EntityLike } from '../types';

type ExternalSubscriberFn<T> = (
  orm: EntityManager,
  config: DockiteConfiguration,
  entity: T,
  oldEntity?: T,
) => any;

export interface ExternalSubscriber {
  // Document related events
  beforeDocumentCreate?: ExternalSubscriberFn<Document>;
  beforeDocumentUpdate?: ExternalSubscriberFn<Document>;
  beforeDocumentDelete?: ExternalSubscriberFn<Document>;
  afterDocumentCreate?: ExternalSubscriberFn<Document>;
  afterDocumentUpdate?: ExternalSubscriberFn<Document>;
  afterDocumentDelete?: ExternalSubscriberFn<Document>;

  // Schema related events
  beforeSchemaCreate?: ExternalSubscriberFn<Schema>;
  beforeSchemaUpdate?: ExternalSubscriberFn<Schema>;
  beforeSchemaDelete?: ExternalSubscriberFn<Schema>;
  afterSchemaCreate?: ExternalSubscriberFn<Schema>;
  afterSchemaUpdate?: ExternalSubscriberFn<Schema>;
  afterSchemaDelete?: ExternalSubscriberFn<Schema>;

  // Field related events
  beforeFieldCreate?: ExternalSubscriberFn<Field>;
  beforeFieldUpdate?: ExternalSubscriberFn<Field>;
  beforeFieldDelete?: ExternalSubscriberFn<Field>;
  afterFieldCreate?: ExternalSubscriberFn<Field>;
  afterFieldUpdate?: ExternalSubscriberFn<Field>;
  afterFieldDelete?: ExternalSubscriberFn<Field>;
}

export type ExternalSubscriberEventType =
  | 'beforeDocumentCreate'
  | 'beforeDocumentUpdate'
  | 'beforeDocumentDelete'
  | 'afterDocumentCreate'
  | 'afterDocumentUpdate'
  | 'afterDocumentDelete'
  | 'beforeSchemaCreate'
  | 'beforeSchemaUpdate'
  | 'beforeSchemaDelete'
  | 'afterSchemaCreate'
  | 'afterSchemaUpdate'
  | 'afterSchemaDelete'
  | 'beforeFieldCreate'
  | 'beforeFieldUpdate'
  | 'beforeFieldDelete'
  | 'afterFieldCreate'
  | 'afterFieldUpdate'
  | 'afterFieldDelete';

/**
 * Retrieves the currently registered `listeners` within the dockite configuration and imports them for usage
 * within the application.
 */
export const getExternalSubscribers = async (): Promise<Array<ExternalSubscriber>> => {
  const config = getConfig();

  return Promise.all(config.listeners.map(listener => importModule<ExternalSubscriber>(listener)));
};

/**
 * Triggers the external subscribers for a given event so that they may run any required logic.
 */
export const triggerExternalSubscriberEvent = async <T = EntityLike>(
  eventType: ExternalSubscriberEventType,
  entity: T,
  oldEntity?: T,
): Promise<void> => {
  const manager = getManager();
  const config = getConfig();

  const subscribers = await getExternalSubscribers();

  await Promise.all(
    subscribers.map(async subsciber => {
      const subscriberMethod = subsciber[eventType];

      if (subscriberMethod && typeof subscriberMethod === 'function') {
        // We need to cast to any here to avoid unwanted type inference
        await subscriberMethod(manager, config, entity as any, oldEntity as any);
      }
    }),
  );
};
