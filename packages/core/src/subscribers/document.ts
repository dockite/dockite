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

import { fireWebhooks } from '../utils/fire-webhooks';

export const afterInsert = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentCreate),
    fireWebhooks(entity, `document:${ScopeIdMap[entity.schemaId] ?? 'unknown'}:create`),
  ]);
};

export const afterUpdate = async (entity: Document): Promise<void> => {
  await Promise.all([
    fireWebhooks(entity, WebhookAction.DocumentUpdate),
    fireWebhooks(entity, `document:${ScopeIdMap[entity.schemaId] ?? 'unknown'}:update`),
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
  listenTo(): typeof Document {
    return Document;
  }

  async afterInsert(event: InsertEvent<Document>): Promise<void> {
    console.log('listener:document:afterInsert', event.entity);
    await afterInsert(event.entity).catch(e =>
      console.log('listener:document:afterInsert:fatal', e),
    );
  }

  async afterUpdate(event: UpdateEvent<Document>): Promise<void> {
    console.log('listener:document:afterUpdate', event.entity);
    await afterUpdate(event.entity).catch(e =>
      console.log('listener:document:afterUpdate:fatal', e),
    );
  }

  async afterRemove(event: RemoveEvent<Document>): Promise<void> {
    console.log('listener:document:afterRemove', event.entity);
    await afterRemove(event.entity as Document).catch(e =>
      console.log('listener:document:afterRemove:fatal', e),
    );
  }
}
