import { Document, Field, FindManyResult, GlobalContext, Schema } from '@dockite/types';
import debug from 'debug';
import {
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  Source,
} from 'graphql';
import { startCase } from 'lodash';
import { Repository } from 'typeorm';

const log = debug('dockite:transformer');

const graphqlCase = (value: string): string => startCase(value).replace(/\s/g, '');

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
        const [outputType, outputArgs] = await Promise.all([
          field.dockiteField!.outputType(dockiteSchemas, types),
          field.dockiteField!.outputArgs(),
        ]);

        return {
          name: String(field.name),
          config: {
            type: outputType,
            resolve: async (root: any, args, context): Promise<any> => {
              const value = root[field.name];
              // eslint-disable-next-line
              return field.dockiteField!.processOutput<typeof outputType>({value, root, args, context});
            },
            args: outputArgs,
          },
        } as FieldConfig<Source, GlobalContext>;
      }),
    );

    typeFields.id = {
      type: GraphQLString,
    };

    // Then add all non-null fields
    fieldsMap.forEach(field => {
      if (field.config !== null) {
        typeFields[String(field.name)] = field.config;
      }
    });
  };

  // Finally return the built object type
  const payload = {
    fieldResolver,
    object: new GraphQLObjectType({
      name: graphqlCase(entity.name),
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
  const allQuery = `all${graphqlCase(entity.name)}`;
  const getQuery = `get${graphqlCase(entity.name)}`;

  const findManyObjectType = new GraphQLObjectType({
    name: `Many${graphqlCase(entity.name)}`,
    fields: {
      results: { type: new GraphQLList(type) },
      totalItems: { type: GraphQLInt },
      currentPage: { type: GraphQLInt },
      totalPages: { type: GraphQLInt },
      hasNextPage: { type: GraphQLBoolean },
    },
  });

  const queries: GraphQLFieldConfigMap<Source, GlobalContext> = {
    [getQuery]: {
      type,
      args: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
      },
      async resolve(_context, { id, name }): Promise<object> {
        if (id) {
          const document = await repository.findOneOrFail(id);
          return { id: document.id, ...document.data };
        }

        if (name) {
          const document = await repository.findOneOrFail({ where: { name } });
          return { id: document.id, ...document.data };
        }

        throw new Error(`${entity.name} not found`);
      },
    },

    [allQuery]: {
      type: findManyObjectType,
      description: entity.settings.description ?? `Retrieves all ${entity.name}`,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        perPage: { type: GraphQLInt, defaultValue: 25 },
      },
      async resolve(_context, { page, perPage }): Promise<FindManyResult<any>> {
        const qb = repository
          .createQueryBuilder('document')
          .where('document.schemaId = :schemaId', { schemaId: entity.id })
          .take(perPage)
          .skip(perPage * (page - 1));

        const [results, totalItems] = await qb.getManyAndCount();

        const totalPages = Math.ceil(totalItems / perPage);

        return {
          results: results.map(doc => ({ id: doc.id, ...doc.data })),
          totalItems,
          currentPage: page,
          hasNextPage: page < totalPages,
          totalPages,
        };
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
