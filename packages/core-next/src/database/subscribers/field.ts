/* eslint-disable class-methods-use-this */
import {
  RemoveEvent,
  UpdateEvent,
  InsertEvent,
  EntitySubscriberInterface,
  EventSubscriber,
} from 'typeorm';

import { Field } from '@dockite/database';

import { triggerExternalSubscriberEvent } from './util';

/**
 *
 */
@EventSubscriber()
export class FieldSubscriber implements EntitySubscriberInterface {
  public listenTo(): typeof Field {
    return Field;
  }

  public async beforeInsert(event: InsertEvent<Field>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('beforeFieldCreate', event.entity);
    }
  }

  public async afterInsert(event: InsertEvent<Field>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('afterFieldCreate', event.entity);
    }
  }

  public async beforeUpdate(event: UpdateEvent<Field>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('beforeFieldUpdate', event.entity, event.databaseEntity);
    }
  }

  public async afterUpdate(event: UpdateEvent<Field>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('afterFieldUpdate', event.entity, event.databaseEntity);
    }
  }

  public async beforeRemove(event: RemoveEvent<Field>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('beforeFieldDelete', event.entity, event.databaseEntity);
    }
  }

  public async afterRemove(event: RemoveEvent<Field>): Promise<void> {
    // We never want to trigger subscribers if we don't have an entity to work with
    if (event.entity) {
      await triggerExternalSubscriberEvent('afterFieldDelete', event.entity, event.databaseEntity);
    }
  }
}

export default FieldSubscriber;
