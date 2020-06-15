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
  }

  afterUpdate(event: UpdateEvent<Document>): void {
    fireWebhooks(event.entity, WebhookAction.DocumentUpdate);
  }

  afterRemove(event: RemoveEvent<Document>): void {
    fireWebhooks(event.entity as Document, WebhookAction.DocumentDelete);
  }
}
