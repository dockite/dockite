import { DockiteField } from '@dockite/field';
import { Document, FieldContext, Schema } from '@dockite/types';
import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';
import { startCase } from 'lodash';

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

  public async outputType(
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    const schemaIds: string[] = this.schemaField.settings.schemaIds ?? [];
    // const schemaIds = this

    const unionTypes = dockiteSchemas
      .filter((schema) => schemaIds.includes(schema.id))
      .map((schema) => types.get(schema.name));

    if (unionTypes.length === 1) {
      const [outputType] = unionTypes;

      return outputType as GraphQLObjectType;
    }

    return new GraphQLUnionType({
      name: `${this.schemaField.name}_Union`,
      types: unionTypes as GraphQLObjectType[],
      resolveType(obj: {schemaName: string}) {
        return graphqlCase(obj.schemaName);
      },
    });
  }

  public async processOutput<T>({ value }: FieldContext): Promise<T> {
    if (!value) {
      return (null as any) as T;
    }

    console.log('asd', value);

    const criteria: { id: string; schemaId: string } = value;

    const document: Document = await this.repositories.Document.createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .where('document.id = :id', { id: criteria.id })
      .andWhere('schema.id = :schemaId', { schemaId: criteria.schemaId })
      .getOne();

    console.log(document);

    return ({ id: document.id, schemaName: document.schema.name, ...document.data } as any) as T;
  }
}
