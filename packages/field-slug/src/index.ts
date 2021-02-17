/* eslint-disable no-await-in-loop */
import { Document } from '@dockite/database';
import { DockiteField } from '@dockite/field';
import { DockiteFieldValidationError, HookContext } from '@dockite/types';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType, GraphQLString } from 'graphql';
import slugify from 'slugify';

import { REMOVE_REGEX } from './constants';
import { defaultOptions, FIELD_TYPE, SlugFieldSettings } from './types';

const DockiteFieldSlugType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldSlug',
});

export class DockiteFieldSlug extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Slug';

  public static description = 'A slug field';

  public static defaultOptions = defaultOptions;

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

    if (settings.parent) {
      if (parent) {
        qb.andWhere(`data-> :field ->> 'id' = :parentId`, {
          field: settings.parent,
          parentId: parent.id,
        });
      } else {
        qb.andWhere(`data->> :field IS NULL`, {
          field: settings.parent,
        });
      }
    }

    return qb.getCount();
  }

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldSlugType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldSlugType;
  }

  public async processInput<T>(ctx: HookContext): Promise<T> {
    let count;

    let increment = 0;

    const settings = this.schemaField.settings as SlugFieldSettings;

    let slug = ctx.fieldData;

    if (
      !slug &&
      settings.fieldsToSlugify &&
      settings.fieldsToSlugify.every(field => !!ctx.data[field])
    ) {
      slug = slugify(
        settings.fieldsToSlugify.map(field => String(ctx.data[field]).trim()).join('-'),
        {
          lower: true,
          replacement: '-',
          remove: REMOVE_REGEX,
        },
      );
    }

    if (slug) {
      slug = slugify(slug, { lower: true, replacement: '-', remove: REMOVE_REGEX });

      const documentId = ctx.document?.id ?? null;

      let shouldContinue = true;

      if (settings.unique) {
        while (shouldContinue === true) {
          if (settings.parent) {
            count = await this.getSlugCount(slug, documentId, ctx.data[settings.parent]);
          } else {
            count = await this.getSlugCount(slug, documentId);
          }

          if (count > 0 && settings.autoIncrement === false) {
            shouldContinue = false;

            throw new DockiteFieldValidationError(
              'SLUG_USED',
              `The slug for ${this.schemaField.title} has already been used.`,
              ctx.path || this.schemaField.name,
            );
          }

          if (count > 0) {
            increment += 1;
            slug = slugify(`${ctx.fieldData}-${increment}`, {
              lower: true,
              replacement: '-',
              remove: REMOVE_REGEX,
            });
          } else {
            shouldContinue = false;
          }
        }
      }
    }

    return (slug as any) as T;
  }
}
