import { Document, Field } from '@dockite/database';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  getRepository,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';

@EventSubscriber()
export class FieldSubscriber implements EntitySubscriberInterface {
  listenTo(): typeof Field {
    return Field;
  }

  async beforeInsert(event: InsertEvent<Field>): Promise<void> {
    const { entity } = event;

    entity.setDockiteField();

    if (!entity.dockiteField) {
      return;
    }

    await entity.dockiteField.onFieldCreate();
  }

  async afterInsert(event: InsertEvent<Field>): Promise<void> {
    const { entity } = event;

    entity.setDockiteField();

    if (!entity.dockiteField) {
      return;
    }

    await entity.dockiteField.onFieldUpdate();

    await getRepository(Document)
      .createQueryBuilder()
      .update()
      .set({
        data: () => `data || '{ "${event.entity.name}": null }'`,
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
}
