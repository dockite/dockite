/* eslint-disable class-methods-use-this */
import {
  RemoveEvent,
  UpdateEvent,
  InsertEvent,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';

import { Document } from '@dockite/database';
import { getScopeResourceById } from '@dockite/manager';
import { WebhookAction } from '@dockite/types';

import { fireWebhooks } from '../../webhooks';

import { triggerExternalSubscriberEvent } from './util';

/**
 *
 */
@EventSubscriber()
export class DocumentSubscriber implements EntitySubscriberInterface {
  public listenTo(): typeof Document {
    return Document;
  }

  public async beforeInsert(event: InsertEvent<Document>): Promise<void> {
    if (event.entity) {
      await triggerExternalSubscriberEvent('beforeDocumentCreate', event.entity);
    }
  }

  public async afterInsert(event: InsertEvent<Document>): Promise<void> {
    if (event.entity) {
      await Promise.all([
        fireWebhooks(event.entity, WebhookAction.DocumentCreate),
        fireWebhooks(
          event.entity,
          `document:${getScopeResourceById(event.entity.schemaId) ?? 'unknown'}:create`,
        ),
      ]);

      await triggerExternalSubscriberEvent('afterDocumentCreate', event.entity);
    }
  }

  public async beforeUpdate(event: UpdateEvent<Document>): Promise<void> {
    if (event.entity) {
      await triggerExternalSubscriberEvent(
        'beforeDocumentUpdate',
        event.entity,
        event.databaseEntity,
      );
    }
  }

  public async afterUpdate(event: UpdateEvent<Document>): Promise<void> {
    if (event.entity) {
      await Promise.all([
        fireWebhooks(event.entity, WebhookAction.DocumentUpdate),
        fireWebhooks(
          event.entity,
          `document:${getScopeResourceById(event.entity.schemaId) ?? 'unknown'}:update`,
        ),
      ]);

      await triggerExternalSubscriberEvent(
        'afterDocumentUpdate',
        event.entity,
        event.databaseEntity,
      );
    }
  }

  public async beforeRemove(event: RemoveEvent<Document>): Promise<void> {
    if (event.entity) {
      await triggerExternalSubscriberEvent(
        'beforeDocumentDelete',
        event.entity,
        event.databaseEntity,
      );
    }
  }

  public async afterRemove(event: RemoveEvent<Document>): Promise<void> {
    if (event.entity) {
      await Promise.all([
        fireWebhooks(event.entity, WebhookAction.DocumentDelete),
        fireWebhooks(
          event.entity,
          `document:${getScopeResourceById(event.entity.schemaId) ?? 'unknown'}:delete`,
        ),
      ]);

      await triggerExternalSubscriberEvent(
        'afterDocumentDelete',
        event.entity,
        event.databaseEntity,
      );
    }
  }
}

export default DocumentSubscriber;
