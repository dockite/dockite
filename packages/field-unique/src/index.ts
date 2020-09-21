import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType } from 'graphql';
import { HookContextWithOldData, HookContext } from '@dockite/types';
import { get } from 'lodash';
import { Document } from '@dockite/database';

import { UniqueFieldSettings } from './types';

type Maybe<T> = T | undefined;

export class DockiteFieldUnique extends DockiteField {
  public static type = 'unique';

  public static title = 'Unique';

  public static description = 'A unique field for ensuring uniqueness of other fields';

  public static defaultOptions: UniqueFieldSettings = {
    required: false,
    validationGroups: [],
  };

  public async inputType(): Promise<GraphQLInputType> {
    return (null as any) as GraphQLInputType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return (null as any) as GraphQLOutputType;
  }

  public async processInput<T>(_ctx: HookContextWithOldData): Promise<T> {
    return (null as any) as T;
  }

  public async onCreate(ctx: HookContext): Promise<void> {
    const settings = this.schemaField.settings as UniqueFieldSettings;

    await Promise.all(
      settings.validationGroups.map(async group => {
        const concat = group.map(g => get(ctx.data, g, '')).join('');

        await this.checkForUniqueness(concat, group, ctx.document as Maybe<Document>);
      }),
    );
  }

  public async onUpdate(ctx: HookContextWithOldData): Promise<void> {
    const settings = this.schemaField.settings as UniqueFieldSettings;

    await Promise.all(
      settings.validationGroups.map(async group => {
        const concat = group.map(g => get(ctx.data, g, '')).join('');

        await this.checkForUniqueness(concat, group, ctx.document as Maybe<Document>);
      }),
    );
  }

  private async checkForUniqueness(
    value: string,
    fields: string[],
    document?: Document | undefined,
  ): Promise<void> {
    const concatFields = fields.map(f => this.columnPartsToColumn(['data', ...f.split('.')]));

    const qb = this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .where(`CONCAT(${concatFields.join(', ')}) = :value`, { value })
      .andWhere('document.schemaId = :schemaId', { schemaId: this.schemaField.schemaId });

    if (document) {
      qb.andWhere('document.id != :documentId', { documentId: document.id });
    }

    const count = await qb.getCount();

    if (count > 0) {
      throw new Error(`Unique validation failed for group: [${fields.join(', ')}]`);
    }
  }

  private columnPartsToColumn(parts: string[]): string {
    const [final, ...other] = parts
      .reverse()
      .map((part, i) => (i === parts.length - 1 ? part : `'${part}'`));

    const columnPath = other.reverse().join('->');

    return `${columnPath}->>${final}`;
  }
}
