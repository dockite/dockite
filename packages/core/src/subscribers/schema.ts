import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Schema } from '@dockite/database';
import { WebhookAction } from '@dockite/types';

import { fireWebhooks } from '../utils/fire-webhooks';

@EventSubscriber()
export class SchemaSubscriber implements EntitySubscriberInterface {
  listenTo(): typeof Schema {
    return Schema;
  }

  afterInsert(event: InsertEvent<Schema>): void {
    fireWebhooks(event.entity, WebhookAction.SchemaCreate);
    fireWebhooks(event.entity, `schema:${event.entity.name ?? 'unknown'}:create`);
  }

  afterUpdate(event: UpdateEvent<Schema>): void {
    fireWebhooks(event.entity, WebhookAction.SchemaUpdate);
    fireWebhooks(event.entity, `schema:${event.entity.name ?? 'unknown'}:update`);
  }

  afterRemove(event: RemoveEvent<Schema>): void {
    fireWebhooks(event.entity as Schema, WebhookAction.SchemaDelete);
    fireWebhooks(event.entity, `schema:${(event.entity as Schema).name ?? 'unknown'}:delete`);
  }
}
