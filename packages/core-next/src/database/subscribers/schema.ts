/* eslint-disable class-methods-use-this */
import {
  RemoveEvent,
  UpdateEvent,
  InsertEvent,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';

import { Schema } from '@dockite/database';

import { triggerExternalSubscriberEvent } from './util';

/**
 *
 */
@EventSubscriber()
export class SchemaSubscriber implements EntitySubscriberInterface {
  public listenTo(): typeof Schema {
    return Schema;
  }

  public async beforeInsert(event: InsertEvent<Schema>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('beforeSchemaCreate', event.entity);
    }
  }

  public async afterInsert(event: InsertEvent<Schema>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('afterSchemaCreate', event.entity);
    }
  }

  public async beforeUpdate(event: UpdateEvent<Schema>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent(
        'beforeSchemaUpdate',
        event.entity,
        event.databaseEntity,
      );
    }
  }

  public async afterUpdate(event: UpdateEvent<Schema>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('afterSchemaUpdate', event.entity, event.databaseEntity);
    }
  }

  public async beforeRemove(event: RemoveEvent<Schema>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent(
        'beforeSchemaDelete',
        event.entity,
        event.databaseEntity,
      );
    }
  }

  public async afterRemove(event: RemoveEvent<Schema>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('afterSchemaDelete', event.entity, event.databaseEntity);
    }
  }
}

export default SchemaSubscriber;
