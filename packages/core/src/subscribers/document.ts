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

@EventSubscriber()
export class DocumentSubscriber implements EntitySubscriberInterface {
  listenTo(): typeof Document {
    return Document;
  }

  afterInsert(event: InsertEvent<Document>): void {
    fireWebhooks(event.entity, WebhookAction.DocumentCreate);
    fireWebhooks(event.entity, `document:${event.entity.schema?.name ?? 'unknown'}:create`);
  }

  afterUpdate(event: UpdateEvent<Document>): void {
    fireWebhooks(event.entity, WebhookAction.DocumentUpdate);
    fireWebhooks(event.entity, `document:${event.entity.schema?.name ?? 'unknown'}:update`);
  }

  afterRemove(event: RemoveEvent<Document>): void {
    fireWebhooks(event.entity as Document, WebhookAction.DocumentDelete);
    fireWebhooks(
      event.entity,
      `document:${(event.entity as Document).schema?.name ?? 'unknown'}:delete`,
    );
  }
}
