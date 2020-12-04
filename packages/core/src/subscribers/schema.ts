import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import * as typeorm from 'typeorm';
import { Schema } from '@dockite/database';
import { WebhookAction } from '@dockite/types';

import { fireWebhooks } from '../utils/fire-webhooks';
import { getConfig } from '../config';

import { getListeners } from './util';

const config = getConfig();

@EventSubscriber()
export class SchemaSubscriber implements EntitySubscriberInterface {
  public listeners: Promise<Record<string, Function>[]>;

  constructor() {
    this.listeners = getListeners();
  }

  listenTo(): typeof Schema {
    return Schema;
  }

  async beforeInsert(event: InsertEvent<Schema>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeSchemaCreate) {
          return x.beforeSchemaCreate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterInsert(event: InsertEvent<Schema>): Promise<void> {
    await Promise.all([
      fireWebhooks(event.entity, WebhookAction.SchemaCreate),
      fireWebhooks(event.entity, `schema:${event.entity.name ?? 'unknown'}:create`),
    ]);

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeSchemaCreate) {
          return x.beforeSchemaCreate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async beforeUpdate(event: UpdateEvent<Schema>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeSchemaUpdate) {
          return x.beforeSchemaUpdate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterUpdate(event: UpdateEvent<Schema>): Promise<void> {
    await Promise.all([
      fireWebhooks(
        { ...event.entity, oldSchema: event.databaseEntity },
        WebhookAction.SchemaUpdate,
      ),
      fireWebhooks(
        { ...event.entity, oldSchema: event.databaseEntity },
        `schema:${event.entity.name ?? 'unknown'}:update`,
      ),
    ]);

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterSchemaUpdate) {
          return x.afterSchemaUpdate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async beforeRemove(event: RemoveEvent<Schema>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeSchemaDelete) {
          return x.beforeSchemaDelete(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterRemove(event: RemoveEvent<Schema>): Promise<void> {
    await Promise.all([
      fireWebhooks(event.entity as Schema, WebhookAction.SchemaDelete),
      fireWebhooks(event.entity, `schema:${(event.entity as Schema).name ?? 'unknown'}:delete`),
    ]);

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterSchemaDelete) {
          return x.afterSchemaDelete(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }
}
