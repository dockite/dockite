import { Document, Field } from '@dockite/database';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  getRepository,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import * as typeorm from 'typeorm';
import format from 'pg-format';

import { getConfig } from '../config';

import { getListeners } from './util';

const config = getConfig();

@EventSubscriber()
export class FieldSubscriber implements EntitySubscriberInterface {
  public listeners: Promise<Record<string, Function>[]>;

  constructor() {
    this.listeners = getListeners();
  }

  listenTo(): typeof Field {
    return Field;
  }

  async beforeInsert(event: InsertEvent<Field>): Promise<void> {
    const { entity } = event;

    const f = new Field();

    f.setDockiteField.apply(entity);

    if (!entity.dockiteField) {
      return;
    }

    await entity.dockiteField.onFieldCreate();

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeFieldCreate) {
          return x.beforeFieldCreate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async beforeUpdate(event: UpdateEvent<Field>): Promise<void> {
    const { entity } = event;

    const f = new Field();

    f.setDockiteField.apply(entity);

    if (!entity.dockiteField) {
      return;
    }

    await entity.dockiteField.onFieldUpdate();

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeFieldUpdate) {
          return x.beforeFieldUpdate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterUpdate(event: UpdateEvent<Field>): Promise<void> {
    const { entity } = event;

    const f = new Field();

    f.setDockiteField.apply(entity);

    if (!entity.dockiteField) {
      return;
    }

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterFieldUpdate) {
          return x.afterFieldUpdate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterInsert(event: InsertEvent<Field>): Promise<void> {
    await getRepository(Document)
      .createQueryBuilder()
      .update()
      .set({
        data: () =>
          `data || jsonb_build_object(${format('%L', event.entity.name)}, ${this.dataToJSONBValue(
            event.entity.settings.default !== undefined
              ? event.entity.settings.default
              : event.entity.dockiteField?.defaultValue(),
          )})`,
      })
      .where('schemaId = :schemaId', { schemaId: event.entity.schemaId })
      .andWhere('data ->> :fieldName IS NULL', { fieldName: event.entity.name })
      .callListeners(false)
      .execute();

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterFieldCreate) {
          return x.afterFieldCreate(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async beforeRemove(event: RemoveEvent<Field>): Promise<void> {
    await getRepository(Document)
      .createQueryBuilder()
      .update()
      .set({
        data: () => `data - '${event.entity?.name}'`,
      })
      .callListeners(false)
      .where('schemaId = :schemaId', { schemaId: event.entity?.schemaId })
      .execute();

    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.beforeFieldRemove) {
          return x.beforeFieldRemove(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  async afterRemove(event: RemoveEvent<Field>): Promise<void> {
    const listeners = await this.listeners;

    await Promise.all(
      listeners.map(x => {
        if (x.afterFieldRemove) {
          return x.afterFieldRemove(event, typeorm, config);
        }

        return Promise.resolve(null);
      }),
    );
  }

  private dataToJSONBValue(data: any): any {
    if (typeof data === 'string') {
      return `${format('%L', data)}`;
    }

    if (typeof data === 'boolean') {
      return data;
    }

    if (typeof data === 'number') {
      return data;
    }

    if (typeof data === 'undefined' || data === null) {
      return null;
    }

    if (typeof data === 'object') {
      return format('%L::jsonb', JSON.stringify(data));
    }

    if (data instanceof Date) {
      return `${format('%L', data.toISOString())}`;
    }

    return `${format('%L', String(data))}`;
  }
}
