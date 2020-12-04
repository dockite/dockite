import { Document } from '@dockite/database';
import { ScopeIdMap } from '@dockite/manager';
import { WebhookAction } from '@dockite/types';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import * as typeorm from 'typeorm';

import { fireWebhooks } from '../utils/fire-webhooks';
import { getConfig } from '../config';

import { getListeners } from './util';

const config = getConfig();

export const afterInsert = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentCreate),
    fireWebhooks(entity, `document:${ScopeIdMap[entity.schemaId] ?? 'unknown'}:create`),
  ]);
};

export const afterUpdate = async (
  entity: Document,
  oldData?: Record<string, any>,
): Promise<void> => {
  await Promise.all([
    fireWebhooks({ ...entity, oldData }, WebhookAction.DocumentUpdate),
    fireWebhooks(
      { ...entity, oldData },
      `document:${ScopeIdMap[entity.schemaId] ?? 'unknown'}:update`,
    ),
  ]);
};

export const afterRemove = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentDelete),
    fireWebhooks(entity, `document:${ScopeIdMap[entity.schemaId] ?? 'unknown'}:delete`),
  ]);
};

@EventSubscriber()
export class DocumentSubscriber implements EntitySubscriberInterface {
  public listeners: Promise<Record<string, Function>[]>;

  constructor() {
    this.listeners = getListeners();
  }

  listenTo(): typeof Document {
    return Document;
  }

  async beforeInsert(event: InsertEvent<Document>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeDocumentCreate) {
          return x.beforeDocumentCreate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterInsert(event: InsertEvent<Document>): Promise<void> {
    await afterInsert(event.entity).catch(e =>
      console.log('listener:document:afterInsert:fatal', e),
    );

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterDocumentCreate) {
          return x.afterDocumentCreate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async beforeUpdate(event: UpdateEvent<Document>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeDocumentUpdate) {
          return x.beforeDocumentUpdate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterUpdate(event: UpdateEvent<Document>): Promise<void> {
    await afterUpdate(event.entity, event.databaseEntity.data).catch(e =>
      console.log('listener:document:afterUpdate:fatal', e),
    );

    const listeners = await this.listeners;

    console.log(listeners);

    await Promise.all(
      listeners.map(x => {
        if (x.afterDocumentUpdate) {
          return x.afterDocumentUpdate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async beforeRemove(event: RemoveEvent<Document>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeDocumentDelete) {
          return x.beforeDocumentDelete(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterRemove(event: RemoveEvent<Document>): Promise<void> {
    await afterRemove(event.entity as Document).catch(e =>
      console.log('listener:document:afterRemove:fatal', e),
    );

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterDocumentDelete) {
          return x.afterDocumentDelete(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }
}
