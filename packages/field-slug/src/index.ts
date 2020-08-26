/* eslint-disable no-await-in-loop */
import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLError,
} from 'graphql';
import { HookContext, HookContextWithOldData } from '@dockite/types';
import { Document } from '@dockite/database';
import slugify from 'slugify';

import { SlugFieldSettings } from './types';

const DockiteFieldSlugType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldSlug',
});

export class DockiteFieldSlug extends DockiteField {
  public static type = 'slug';

  public static title = 'Slug';

  public static description = 'A slug field';

  public static defaultOptions: SlugFieldSettings = {
    fieldToSlugify: null,
    parent: null,
    unique: true,
  };

  private async getSlugCount(
    value: string,
    documentId: string | null,
    parent?: { id: string },
  ): Promise<number> {
    const settings = this.schemaField.settings as SlugFieldSettings;

    const qb = await this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .where('document.data ->> :fieldName ILIKE :value', {
        fieldName: this.schemaField.name,
        value,
      })
      .andWhere('document.schemaId = :schemaId', { schemaId: this.schemaField.schemaId });

    if (documentId) {
      qb.andWhere('document.id != :documentId', { documentId });
    }

    if (settings.parent && parent) {
      qb.andWhere(`data-> :field ->> 'id' = :documentId`, {
        field: settings.parent,
        documentId: parent.id,
      });
    }

    return qb.getCount();
  }

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldSlugType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldSlugType;
  }

  public async validateInputGraphQL(ctx: HookContextWithOldData): Promise<void> {
    const settings = this.schemaField.settings as SlugFieldSettings;

    let slugCount = 0;

    if (settings.unique) {
      if (settings.parent && ctx.data[settings.parent]) {
        slugCount = await this.getSlugCount(
          ctx.fieldData,
          ctx.document?.id ?? null,
          ctx.data[settings.parent],
        );
      } else {
        slugCount = await this.getSlugCount(ctx.fieldData, ctx.document?.id ?? null);
      }
    }

    if (slugCount > 0) {
      throw new GraphQLError(`${this.schemaField.name}: slug provided has already been used`);
    }
  }

  public async processInputGraphQL<T>(ctx: HookContext): Promise<T> {
    const settings = this.schemaField.settings as SlugFieldSettings;

    let slug = ctx.fieldData;

    if (slug) {
      slug = slugify(ctx.fieldData, { lower: true, replacement: '-' });
    } else if (settings.fieldToSlugify) {
      slug = slugify(ctx.data[settings.fieldToSlugify], { lower: true, replacement: '-' });
    } else {
      slug = null;
    }

    return (slug as any) as T;
  }

  public async processInputRaw<T>(ctx: HookContext): Promise<T> {
    let count;
    let increment = 0;
    const settings = this.schemaField.settings as SlugFieldSettings;

    let slug = ctx.fieldData;

    if (slug) {
      slug = slugify(ctx.fieldData, { lower: true, replacement: '-' });

      const documentId = ctx.document?.id ?? null;

      let shouldContinue = true;

      if (settings.unique) {
        while (shouldContinue === true) {
          if (settings.parent && ctx.data[settings.parent]) {
            count = await this.getSlugCount(slug, documentId, ctx.data[settings.parent]);
          } else {
            count = await this.getSlugCount(slug, documentId);
          }

          if (count > 0) {
            increment += 1;
            slug = slugify(`${ctx.fieldData}-${increment}`, { lower: true, replacement: '-' });
          } else {
            shouldContinue = false;
          }
        }
      }
    }

    return (slug as any) as T;
  }
}
