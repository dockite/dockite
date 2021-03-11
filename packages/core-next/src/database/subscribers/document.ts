/* eslint-disable class-methods-use-this */
import {
  RemoveEvent,
  UpdateEvent,
  InsertEvent,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';

import { Document } from '@dockite/database';

import { triggerExternalSubscriberEvent } from './util';

/**
 *
 */
@EventSubscriber()
export class DocumentSubscriber implements EntitySubscriberInterface {
  public async beforeInsert(event: InsertEvent<Document>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      // eslint-disable-next-line prettier/prettier
      await triggerExternalSubscriberEvent('beforeDocumentCreate', event.entity);
    }
  }

  public async afterInsert(event: InsertEvent<Document>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      // eslint-disable-next-line prettier/prettier
      await triggerExternalSubscriberEvent('afterDocumentCreate', event.entity);
    }
  }

  public async beforeUpdate(event: UpdateEvent<Document>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      // eslint-disable-next-line prettier/prettier
      await triggerExternalSubscriberEvent('beforeDocumentUpdate', event.entity, event.databaseEntity);
    }
  }

  public async afterUpdate(event: UpdateEvent<Document>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      // eslint-disable-next-line prettier/prettier
      await triggerExternalSubscriberEvent('afterDocumentUpdate', event.entity, event.databaseEntity);
    }
  }

  public async beforeRemove(event: RemoveEvent<Document>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      // eslint-disable-next-line prettier/prettier
      await triggerExternalSubscriberEvent('beforeDocumentDelete', event.entity, event.databaseEntity);
    }
  }

  public async afterRemove(event: RemoveEvent<Document>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      // eslint-disable-next-line prettier/prettier
      await triggerExternalSubscriberEvent('afterDocumentDelete', event.entity, event.databaseEntity);
    }
  }
}

export default DocumentSubscriber;
