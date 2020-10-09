import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType } from 'graphql';
import { HookContextWithOldData, HookContext, DockiteFieldValidationError } from '@dockite/types';
import { get } from 'lodash';
import format from 'pg-format';
import { Document } from '@dockite/database';

import { UniqueFieldSettings, Constraint } from './types';

type Maybe<T> = T | undefined;

export class DockiteFieldUnique extends DockiteField {
  public static type = 'unique';

  public static title = 'Unique';

  public static description = 'A unique field for ensuring uniqueness of other fields';

  public static defaultOptions: UniqueFieldSettings = {
    required: false,
    validationGroups: [],
    constraints: [],
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
        const schemaFields = this.schemaField.schema?.fields ?? [];
        const concat = group.map(g => this.getValueFromPath(ctx.data, g));
        const fieldTitles = group.map(g => schemaFields.find(f => f.name === g) ?? g);

        if (this.meetsConstraints(settings.constraints ?? [], ctx.data)) {
          await this.checkForUniqueness(concat, group, ctx.document as Maybe<Document>).catch(
            () => {
              throw new DockiteFieldValidationError(
                'UNIQUE_FAILURE',
                `Combination of ${fieldTitles.join(', ')} were not unique`,
                ctx.path || this.schemaField.name,
              );
            },
          );
        }
      }),
    );
  }

  public async onUpdate(ctx: HookContextWithOldData): Promise<void> {
    const settings = this.schemaField.settings as UniqueFieldSettings;

    await Promise.all(
      settings.validationGroups.map(async group => {
        const schemaFields = this.schemaField.schema?.fields ?? [];
        const concat = group.map(g => this.getValueFromPath(ctx.data, g));
        const fieldTitles = group.map(g => schemaFields.find(f => f.name === g) ?? g);

        if (this.meetsConstraints(settings.constraints ?? [], ctx.data)) {
          await this.checkForUniqueness(concat, group, ctx.document as Maybe<Document>).catch(
            () => {
              throw new DockiteFieldValidationError(
                'UNIQUE_FAILURE',
                `Combination of ${fieldTitles.join(', ')} were not unique`,
                ctx.path || this.schemaField.name,
              );
            },
          );
        }
      }),
    );
  }

  private getValueFromPath(data: Record<string, any>, path: string): string {
    const value = get(data, path, '');

    if (typeof value === 'object') {
      return format('(%L::jsonb)::text', JSON.stringify(value));
    }

    return format('%L::text', String(value));
  }

  private async checkForUniqueness(
    values: string[],
    fields: string[],
    document?: Document | undefined,
  ): Promise<void> {
    const concatFields = fields.map(f => this.columnPartsToColumn(['data', ...f.split('.')]));

    const qb = this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .where(`CONCAT(${concatFields.join(', ')}) = CONCAT(${values.join(', ')})`)
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

  private meetsConstraints(constraints: Constraint[], data: Record<string, any>): boolean {
    if (constraints.length === 0) {
      return true;
    }

    const result = !constraints.some(constraint => {
      if (constraint.operator === '$eq') {
        return constraint.value !== get(data, constraint.name);
      }

      return constraint.value === get(data, constraint.name);
    });

    return result;
  }
}
