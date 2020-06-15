import { DockiteField } from '@dockite/field';
import { Document } from '@dockite/database';
import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import { startCase } from 'lodash';
import { FieldIOContext, FieldContext } from '@dockite/types';

const graphqlCase = (value: string): string => startCase(value).replace(/\s/g, '');

const DockiteFieldReferenceInputType = new GraphQLInputObjectType({
  name: 'ReferenceFieldInput',
  fields: {
    id: { type: GraphQLString },
    schemaId: { type: GraphQLString },
  },
});

export class DockiteFieldReference extends DockiteField {
  public static type = 'reference';

  public static title = 'Reference';

  public static description = 'A reference field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldReferenceInputType;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async outputType({
    dockiteSchemas,
    graphqlTypes,
  }: FieldIOContext): Promise<GraphQLOutputType> {
    const schemaIds: string[] = this.schemaField.settings.schemaIds ?? [];

    const unionTypes = dockiteSchemas
      .filter((schema) => schemaIds.includes(schema.id))
      .map((schema) => graphqlTypes.get(schema.name));

    if (unionTypes.length === 1) {
      const [outputType] = unionTypes;

      return outputType as GraphQLObjectType;
    }

    return new GraphQLUnionType({
      name: `${this.schemaField.name}_Union`,
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
