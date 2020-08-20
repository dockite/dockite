import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLInt, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import { HookContext } from '@dockite/types';
import { Document } from '@dockite/database';

import { SortIndexFieldSettings } from './types';

const DockitefieldSortIndexType = new GraphQLScalarType({
  ...GraphQLInt.toConfig(),
  name: 'DockiteFieldSortIndex',
});

export class DockiteFieldSortIndex extends DockiteField {
  public static type = 'sort-index';

  public static title = 'Sort Index';

  public static description = 'A sort index field, used for maintaining tree view positioning.';

  public static defaultOptions: SortIndexFieldSettings = {
    parentField: null,
  };

  public async inputType(): Promise<GraphQLInputType> {
    return DockitefieldSortIndexType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockitefieldSortIndexType;
  }

  public async onCreate(ctx: HookContext): Promise<void> {
    const settings = this.schemaField.settings as SortIndexFieldSettings;

    const qb = this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .select(`COALESCE(MAX((data->'${this.schemaField.name}')::int), 0)`, 'max')
      .where('document."schemaId" = :schemaId', { schemaId: this.schemaField.schemaId });

    if (settings.parentField && ctx.data[settings.parentField]) {
      qb.andWhere(`data-> :field ->> 'id' = :documentId`, {
        field: settings.parentField,
        documentId: ctx.data[settings.parentField].id,
      });
    }

    const value = await qb.getRawOne();

    ctx.data[this.schemaField.name] = Number(value.max) + 1;
  }

  public async onUpdate(ctx: HookContext): Promise<void> {
    const settings = this.schemaField.settings as SortIndexFieldSettings;

    if (ctx.fieldData === -1) {
      const qb = this.orm
        .getRepository(Document)
        .createQueryBuilder('document')
        .select(`COALESCE(MAX((data->'${this.schemaField.name}')::int), 0)`, 'max')
        .where('document."schemaId" = :schemaId', { schemaId: this.schemaField.schemaId });

      if (settings.parentField && ctx.data[settings.parentField]) {
        qb.andWhere(`data-> :field ->> 'id' = :documentId`, {
          field: settings.parentField,
          documentId: ctx.data[settings.parentField].id,
        });
      }

      const value = await qb.getRawOne();

      ctx.data[this.schemaField.name] = Number(value.max) + 1;
    }
  }

  public async onSoftDelete(ctx: HookContext): Promise<void> {
    const settings = this.schemaField.settings as SortIndexFieldSettings;
    const fieldName = this.schemaField.name;

    const qb = this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .update()
      .set({
        data: () => `data || jsonb_build_object('${fieldName}', (data->'${fieldName}')::int - 1)`,
      })
      .where('document."schemaId" = :schemaId', { schemaId: this.schemaField.schemaId })
      .andWhere('(data -> :fieldName)::int > :value', { fieldName, value: ctx.fieldData });

    if (settings.parentField && ctx.data[settings.parentField]) {
      qb.andWhere(`data-> :field ->> 'id' = :documentId`, {
        field: settings.parentField,
        documentId: ctx.data[settings.parentField].id,
      });
    }

    await qb.execute();

    ctx.data[fieldName] = -1;
  }
}
