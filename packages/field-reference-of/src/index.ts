import { DockiteField } from '@dockite/field';
import { FieldContext, FieldIOContext } from '@dockite/types';
import { Document } from '@dockite/database';
import {
  GraphQLEnumType,
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
} from 'graphql';

export class DockiteFieldReferenceOf extends DockiteField {
  public static type = 'reference_of';

  public static title = 'Reference Of';

  public static description =
    'A reference of field. Returns a list of documents that refernence this document.';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    // A dirty hack but we don't want this field to allow input.
    return (null as any) as GraphQLInputType;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async outputType({
    dockiteSchemas,
    graphqlTypes,
  }: FieldIOContext): Promise<GraphQLOutputType> {
    const schemaId: string = this.schemaField.settings.schemaId ?? this.schemaField.schemaId;

    const [schemaType] = dockiteSchemas
      .filter((schema) => schemaId === schema.id)
      .map((schema) => graphqlTypes.get(schema.name));

    return new GraphQLList(schemaType as GraphQLObjectType);
  }

  public async outputArgs(): Promise<GraphQLFieldConfigArgumentMap> {
    return {
      page: { type: GraphQLInt, defaultValue: 1 },
      perPage: { type: GraphQLInt, defaultValue: 5 },
      orderBy: { type: GraphQLString, defaultValue: 'updatedAt' },
      orderDirection: {
        type: new GraphQLEnumType({
          name: `OrderDirection_${this.schemaField.name}`,
          values: { DESC: { value: 'DESC' }, ASC: { value: 'ASC' } },
        }),
        defaultValue: 'DESC',
      },
    } as GraphQLFieldConfigArgumentMap;
  }

  public async processOutputGraphQL<T>({ data, args }: FieldContext): Promise<T> {
    if (!args) {
      throw new Error("Output type wasn't built correctly");
    }

    const { schemaId, fieldName } = this.schemaField.settings;
    const { page, perPage } = args;

    const qb = this.orm
      .getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .andWhere('schema.id = :schemaId', { schemaId })
      .andWhere("document.data -> :field ->> 'id' = :documentId", {
        field: fieldName,
        documentId: data.id,
      })
      .take(perPage)
      .offset((page - 1) * perPage);

    if (args.orderBy !== 'id' && Object.keys(data).includes(args.orderBy)) {
      qb.addOrderBy(`document.data->>'${args.orderBy}'`, args.orderDirection);
    } else {
      qb.addOrderBy(`document.${args.orderBy}`, args.orderDirection);
    }

    const documents: Document[] = await qb.getMany();

    return (documents.map((d) => ({ id: d.id, ...d.data })) as any) as T;
  }
}
