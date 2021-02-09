/* eslint-disable class-methods-use-this */

import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { startCase } from 'lodash';

import { Document } from '@dockite/database';
import { DockiteField } from '@dockite/field';
import { FieldContext, FieldIOContext } from '@dockite/types';

import { defaultOptions, FIELD_TYPE } from './types';

const graphqlCase = (value: string): string => startCase(value).replace(/\s/g, '');

const DockiteFieldReferenceInputType = new GraphQLInputObjectType({
  name: 'ReferenceFieldInput',
  fields: {
    id: { type: GraphQLNonNull(GraphQLString) },
    schemaId: { type: GraphQLNonNull(GraphQLString) },
    identifier: { type: GraphQLString },
  },
});

export class DockiteFieldReference extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Reference';

  public static description = 'A reference field';

  public static defaultOptions = {
    ...defaultOptions,
  };

  private updateSchemaIdPointers(): void {
    if (
      this.schemaField.settings.schemaIds &&
      this.schemaField.settings.schemaIds.includes('self')
    ) {
      const index = this.schemaField.settings.schemaIds.indexOf('self');

      this.schemaField.settings.schemaIds[index] = this.schemaField.schemaId;
    }
  }

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldReferenceInputType;
  }

  public async processInputGraphQL<T>({ fieldData }: FieldContext): Promise<T> {
    if (!fieldData) {
      return (null as any) as T;
    }

    const criteria: { id: string; schemaId: string } = fieldData;

    const document: Document | undefined = await this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .where('document.id = :id', { id: criteria.id })
      .andWhere('schema.id = :schemaId', { schemaId: criteria.schemaId })
      .getOne();

    if (!document) {
      return (null as any) as T;
    }

    let identifier = document.id;

    if (document.data.name) {
      identifier = document.data.name;
    } else if (document.data.title) {
      identifier = document.data.title;
    } else if (document.data.identifier) {
      identifier = document.data.identifier;
    }

    return ({ ...fieldData, identifier } as any) as T;
  }

  public async onFieldCreate(): Promise<void> {
    this.updateSchemaIdPointers();
  }

  public async onFieldUpdate(): Promise<void> {
    this.updateSchemaIdPointers();
  }

  public async outputType({
    dockiteSchemas,
    graphqlTypes,
  }: FieldIOContext): Promise<GraphQLOutputType> {
    const schemaIds: string[] = this.schemaField.settings.schemaIds ?? [];

    const unionTypes = dockiteSchemas
      .filter(schema => schemaIds.includes(schema.id))
      .map(schema => graphqlTypes.get(schema.name));

    if (unionTypes.length === 0) {
      console.error(
        `[ERROR]: No schemas found for "${this.schemaField.name}" of "${this.schemaField.schema
          ?.name ?? 'Unknown'}"`,
      );

      return GraphQLJSON;
    }

    if (unionTypes.length === 1) {
      const [outputType] = unionTypes;

      return outputType as GraphQLObjectType;
    }

    return new GraphQLUnionType({
      name: `${this.schemaField.name}${this.schemaField.schema?.name ?? 'Unknown'}Union`,
      types: unionTypes as GraphQLObjectType[],
      resolveType(obj: { schemaName: string }) {
        return graphqlCase(obj.schemaName);
      },
    });
  }

  public async processOutputGraphQL<T>({ fieldData }: FieldContext): Promise<T> {
    if (!fieldData) {
      return (null as any) as T;
    }

    const criteria: { id: string; schemaId: string } = fieldData;

    const document: Document | undefined = await this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .where('document.id = :id', { id: criteria.id })
      .andWhere('schema.id = :schemaId', { schemaId: criteria.schemaId })
      .getOne();

    if (!document) {
      return (null as any) as T;
    }

    return ({ id: document.id, schemaName: document.schema.name, ...document.data } as any) as T;
  }
}

export default DockiteFieldReference;
