import { GlobalContext, Field, Document, Schema } from '@dockite/types';
import debug from 'debug';
import {
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  Source,
  GraphQLFieldConfig,
  GraphQLSchema,
} from 'graphql';
import { camelCase } from 'lodash';
import { Repository } from 'typeorm';

const log = debug('dockite:transformer');

interface FieldConfig<Source, Context> {
  name: string;
  config: GraphQLFieldConfig<Source, Context>;
}

const createObjectType = async (
  entity: Schema,
): Promise<{
  fieldResolver: (dockiteSchemas: Schema[], types: Map<string, GraphQLObjectType>) => Promise<void>;
  object: GraphQLObjectType;
}> => {
  // Build our empty field map
  log(`Building object type for ${entity.name}`);
  const typeFields: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  // Retrieve our field configs from the registered dockite-fields
  const fieldResolver = async (
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
  ): Promise<void> => {
    const fieldsMap: FieldConfig<Source, GlobalContext>[] = await Promise.all(
      entity.fields.map(async (field: Field) => {
        // eslint-disable-next-line
        const outputType = await field.dockiteField!.outputType(dockiteSchemas, types);

        return {
          name: field.name,
          config: {
            type: outputType,
            resolve: async (obj): Promise<any> => {
              // eslint-disable-next-line
              return field.dockiteField!.processOutput<typeof outputType>(obj);
            },
          },
        } as FieldConfig<Source, GlobalContext>;
      }),
    );

    // Then add all non-null fields
    fieldsMap.forEach(field => {
      if (field.config !== null) {
        typeFields[field.name] = field.config;
      }
    });
  };

  // Finally return the built object type
  const payload = {
    fieldResolver,
    object: new GraphQLObjectType({
      name: entity.name,
      fields: typeFields,
    }),
  };

  return payload;
};

export const createQueriesForEntity = async <T extends Document>(
  entity: Schema,
  repository: Repository<T>,
  type: GraphQLObjectType,
): Promise<GraphQLFieldConfigMap<Source, GlobalContext>> => {
  const allQuery = camelCase(`all${entity.name}`);
  const getQuery = camelCase(`get${entity.name}`);

  const queries: GraphQLFieldConfigMap<Source, GlobalContext> = {
    [getQuery]: {
      type,
      args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
      },
      // eslint-disable-next-line
        resolve(_context: any, { id, name }): Promise<object> {
        if (id) {
          return repository.findOneOrFail(id);
        }

        if (name) {
          return repository.findOneOrFail({ where: { name } });
        }

        throw new Error(`${entity.name} not found`);
      },
    },

    [allQuery]: {
      type: new GraphQLList(type),
      description: entity.settings.description ?? `Retrieves all ${entity.name}`,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        perPage: { type: GraphQLInt, defaultValue: 25 },
      },
      async resolve(_context, { page, perPage }): Promise<object[]> {
        const qb = repository
          .createQueryBuilder('document')
          .where('document.schemaId = :schemaId', { schemaId: entity.id })
          .take(perPage)
          .skip(perPage * (page - 1));

        const documents = await qb.getMany();

        return documents.map(document => document.data);
      },
    },
  };

  return queries;
};

export const createSchema = async <T extends Document>(
  dockiteSchemas: Schema[],
  documentRepository: Repository<T>,
): Promise<GraphQLSchema> => {
  const types = new Map<string, GraphQLObjectType>();
  const fieldResolvers: ((
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
  ) => Promise<void>)[] = [];

  await Promise.all(
    dockiteSchemas.map(schema =>
      createObjectType(schema).then(result => {
        types.set(schema.name, result.object);
        fieldResolvers.push(result.fieldResolver);
      }),
    ),
  );

  await Promise.all(fieldResolvers.map(fieldResolver => fieldResolver(dockiteSchemas, types)));

  const queries = await Promise.all(
    dockiteSchemas.map(schema =>
      createQueriesForEntity(
        schema,
        documentRepository,
        types.get(schema.name) as GraphQLObjectType,
      ),
    ),
  );

  let queryFields = {};

  queries.forEach(q => {
    queryFields = { ...queryFields, ...q };
  });

  const gqlSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
  });

  return gqlSchema;
};
