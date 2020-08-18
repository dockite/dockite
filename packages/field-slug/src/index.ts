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
  };

  private async getSlugCount(value: string, documentId: string | null): Promise<number> {
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

    return qb.getCount();
  }

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldSlugType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldSlugType;
  }

  public async validateInputGraphQL(ctx: HookContextWithOldData): Promise<void> {
    const slugCount = await this.getSlugCount(ctx.fieldData, ctx.document?.id ?? null);

    if (slugCount > 0) {
      throw new GraphQLError(`${this.schemaField.name}: slug provided has already been used`);
    }
  }

  public async processInput<T>(ctx: HookContext): Promise<T> {
    let count;
    let increment = 0;

    let slug = ctx.fieldData;

    if (slug) {
      slug = slugify(ctx.fieldData, { lower: true, replacement: '-' });

      const documentId = ctx.document?.id ?? null;

      let shouldContinue = true;

      while (shouldContinue === true) {
        // eslint-disable-next-line no-await-in-loop
        count = await this.getSlugCount(slug, documentId);

        if (count > 0) {
          increment += 1;
          slug = slugify(`${ctx.fieldData}-${increment}`, { lower: true, replacement: '-' });
        } else {
          shouldContinue = false;
        }
      }
    }

    return (slug as any) as T;
  }
}
