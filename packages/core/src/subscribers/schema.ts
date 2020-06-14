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
  }

  afterUpdate(event: UpdateEvent<Schema>): void {
    fireWebhooks(event.entity, WebhookAction.SchemaUpdate);
  }

  afterRemove(event: RemoveEvent<Schema>): void {
    fireWebhooks(event.entity as Schema, WebhookAction.SchemaDelete);
  }
}
