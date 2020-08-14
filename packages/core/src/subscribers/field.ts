import { Document, Field } from '@dockite/database';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  getRepository,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class FieldSubscriber implements EntitySubscriberInterface {
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
  }

  async beforeUpdate(event: UpdateEvent<Field>): Promise<void> {
    const { entity } = event;

    const f = new Field();

    f.setDockiteField.apply(entity);

    if (!entity.dockiteField) {
      return;
    }

    await entity.dockiteField.onFieldUpdate();
  }

  async afterInsert(event: InsertEvent<Field>): Promise<void> {
    await getRepository(Document)
      .createQueryBuilder()
      .update()
      .set({
        data: () =>
          `data || '{ "${event.entity.name}": ${this.dataToJSONBValue(
            event.entity.settings.default,
          )} }'`,
        updatedAt: () => '"updatedAt"',
      })
      .where('schemaId = :schemaId', { schemaId: event.entity.schemaId })
      .andWhere('data ->> :fieldName IS NULL', { fieldName: event.entity.name })
      .execute();
  }

  async beforeRemove(event: RemoveEvent<Field>): Promise<void> {
    await getRepository(Document)
      .createQueryBuilder()
      .update()
      .set({
        data: () => `data - '${event.entity?.name}'`,
        updatedAt: () => '"updatedAt"',
      })
      .where('schemaId = :schemaId', { schemaId: event.entity?.schemaId })
      .execute();
  }

  private dataToJSONBValue(data: any): any {
    if (typeof data === 'string') {
      return `"${data}"`;
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

    if (data instanceof Date) {
      return `"${data.toISOString()}"`;
    }

    return `"${data}"`;
  }
}
