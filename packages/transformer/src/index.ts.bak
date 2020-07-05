/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-param-reassign */
import {
  DockiteFieldStatic,
  Document,
  Field,
  FindManyResult,
  GlobalContext,
  Schema,
} from '@dockite/types';
import { WhereBuilder, WhereBuilderInputType } from '@dockite/where-builder';
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

// This turns any text into mostly GraphQL compliant strings.
// TODO: Deprecate this once schemas have an option for both name and title
const graphqlCase = (value: string): string => startCase(value).replace(/\s/g, '');

// This is the shape of a field config item which
// is used for building the corresponding GraphQL types.
interface FieldConfigItem<Source, Context> {
  name: string;
  config: GraphQLFieldConfig<Source, Context>;
}

// The shape of a field resolver function which
// is used for populating the fields of an object
// type post-instantiation.
type FieldResolverFn = (
  dockiteSchemas: Schema[],
  types: Map<string, GraphQLObjectType>,
  dockiteFields: Record<string, DockiteFieldStatic>,
) => Promise<void>;

/**
 * Provided an entity and a map for storing fields, build and return a function
 * that will resolve each field and then add them types map.
 *
 * @param entity
 * @param typeFields
 */
const makeFieldResolverFn = (
  entity: Schema,
  typeFields: GraphQLFieldConfigMap<Source, GlobalContext>,
): FieldResolverFn => {
  return async (
    dockiteSchemas: Schema[],
    graphqlTypes: Map<string, GraphQLObjectType>,
    dockiteFields: Record<string, DockiteFieldStatic>,
  ): Promise<void> => {
    const fieldsMap: FieldConfigItem<Source, GlobalContext>[] = await Promise.all(
      entity.fields.map(async (field: Field) => {
        const [outputType, outputArgs] = await Promise.all([
          field.dockiteField!.outputType({
            dockiteSchemas,
            graphqlTypes,
            dockiteFields,
          }),
          field.dockiteField!.outputArgs(),
        ]);

        return {
          name: String(field.name),
          config: {
            type: outputType,
            resolve: async (data: Record<string, any>, args): Promise<any> => {
              const fieldData = data[field.name];

              return field.dockiteField!.processOutputGraphQL<typeof outputType>({
                field,
                fieldData,
                data,
                args,
              });
            },
            args: outputArgs,
          },
        } as FieldConfigItem<Source, GlobalContext>;
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
};

/**
 * Provided a schema this method will create an GraphQL object type
 * for it containing all of it's associated fields and corresponding
 * resolvers for said fields.
 *
 * @param entity The schema to create an object type for
 */
const createObjectType = async (
  entity: Schema,
): Promise<{
  fieldResolver: FieldResolverFn;
  object: GraphQLObjectType;
}> => {
  log(`Building object type for ${entity.name}`);
  // Build our empty field map
  const typeFields: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  // Retrieve our field configs from the registered dockite-fields
  const fieldResolver = makeFieldResolverFn(entity, typeFields);

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

/**
 * Provided a schema, its corresponding GraphQL Object and access to
 * retrieve documents from the database this method will create the required
 * queries for retreiving either a singlular or multiple schema items.
 *
 * @param entity
 * @param repository
 * @param type
 */
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
        where: { type: WhereBuilderInputType },
      },
      async resolve(_context, { where, page, perPage }): Promise<FindManyResult<any>> {
        const qb = repository
          .createQueryBuilder('document')
          .where('document.schemaId = :schemaId', { schemaId: entity.id });

        if (where) {
          WhereBuilder.Build(qb, where);
        }

        qb.take(perPage).skip(perPage * (page - 1));

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

/**
 * Provided an array of Schemas, a map of DockiteFields and access to retrieve
 * documents from the database this method will create a GraphQL Schema for each
 * Schema entity including its corresponding fields and resolvers.
 *
 * @param dockiteSchemas
 * @param documentRepository
 * @param dockiteFields
 */
export const createSchema = async <T extends Document>(
  dockiteSchemas: Schema[],
  documentRepository: Repository<T>,
  dockiteFields: Record<string, DockiteFieldStatic>,
): Promise<GraphQLSchema> => {
  const objectTypeManager = new Map<string, GraphQLObjectType>();
  const fieldResolvers: FieldResolverFn[] = [];

  await Promise.all(
    dockiteSchemas.map(schema =>
      createObjectType(schema).then(result => {
        objectTypeManager.set(schema.name, result.object);
        fieldResolvers.push(result.fieldResolver);
      }),
    ),
  );

  await Promise.all(
    fieldResolvers.map(fieldResolver =>
      fieldResolver(dockiteSchemas, objectTypeManager, dockiteFields),
    ),
  );

  const queries = await Promise.all(
    dockiteSchemas.map(schema =>
      createQueriesForEntity(
        schema,
        documentRepository,
        objectTypeManager.get(schema.name) as GraphQLObjectType,
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
