import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Document } from '@dockite/database';
import { WebhookAction } from '@dockite/types';

import { fireWebhooks } from '../utils/fire-webhooks';

export const afterInsert = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentCreate),
    fireWebhooks(entity, `document:${entity.schema?.name ?? 'unknown'}:create`),
  ]);
};

export const afterUpdate = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentUpdate),
    fireWebhooks(entity, `document:${entity.schema?.name ?? 'unknown'}:update`),
  ]);
};

export const afterRemove = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentDelete),
    fireWebhooks(entity, `document:${entity.schema?.name ?? 'unknown'}:delete`),
  ]);
};

@EventSubscriber()
export class DocumentSubscriber implements EntitySubscriberInterface {
  listenTo(): typeof Document {
    return Document;
  }

  afterInsert(event: InsertEvent<Document>): void {
    afterInsert(event.entity);
  }

  afterUpdate(event: UpdateEvent<Document>): void {
    afterUpdate(event.entity);
  }

  afterRemove(event: RemoveEvent<Document>): void {
    afterRemove(event.entity as Document);
  }
}
