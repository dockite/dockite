import { can } from '@dockite/ability';
import { Schema, Document, User, DocumentRevision, SchemaType, Field } from '@dockite/database';
import {
  DockiteFieldStatic,
  GlobalContext,
  FindManyResult,
  DockiteGraphqlSortInputType,
} from '@dockite/types';
import {
  GraphQLFieldConfigMap,
  GraphQLObjectType,
  Source,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLInputFieldConfigMap,
  GraphQLResolveInfo,
  GraphQLSchemaConfig,
} from 'graphql';
import { cloneDeep, omit } from 'lodash';
import debug from 'debug';
import typeorm from 'typeorm';
import { Express } from 'express';
import { WhereBuilderInputType, WhereBuilder } from '@dockite/where-builder';

import { strToColumnPath } from './util';

type MaybePromise<T> = T | Promise<T>;

const log = debug('dockite:transformer');

let anonymousUser: User;

interface ConfigBagItem {
  schema: Schema;
  schemas: Schema[];
  fieldConfigMap: GraphQLFieldConfigMap<Source, GlobalContext>;
  graphqlObjectType: GraphQLObjectType;
  objectTypeMap: Map<string, GraphQLObjectType>;
  dockiteFieldsMap: Record<string, DockiteFieldStatic>;
  orm: typeof typeorm;
  externalAuthenticationModule: {
    authenticated: (
      req: Express.Request,
      info: GraphQLResolveInfo,
      resolverName: string,
      schema: Schema,
    ) => MaybePromise<string | boolean>;
    authorized: (
      req: Express.Request,
      info: GraphQLResolveInfo,
      resolverName: string,
      schema: Schema,
    ) => MaybePromise<boolean>;
  };
}

/**
 * Determines if a user is authenticated and authorized using the external
 * authentication package.
 */
const isAuthenticatedAndAuthorized = async (
  config: ConfigBagItem,
  ctx: GlobalContext,
  info: GraphQLResolveInfo,
  resolverName: string,
): Promise<string | boolean> => {
  const { externalAuthenticationModule, schema } = config;
  let authenticated: string | boolean = false;

  try {
    authenticated = await externalAuthenticationModule.authenticated(
      ctx.req,
      info,
      resolverName,
      schema,
    );
  } catch (err) {
    log('authenticated', err);
  }

  if (!authenticated) {
    return false;
  }

  let authorized = false;

  try {
    authorized = await externalAuthenticationModule.authorized(ctx.req, info, resolverName, schema);
  } catch (err) {
    log('authorized', err);
  }

  if (!authorized) {
    return false;
  }

  return authenticated;
};

const makeInitialFieldDataForDocument = (fields: Field[]): Record<string, any> => {
  return fields.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.name]: curr.settings.default ?? null,
    };
  }, {});
};

/**
 * Given a schema, create the corresponding GraphQLObjectType
 * which will be used in resolvers and the Query object.
 *
 * @param schema The schema entity
 */
const createGraphQLObjectTypeForSchema = async (
  schema: Schema,
): Promise<{
  fieldConfigMap: GraphQLFieldConfigMap<Source, GlobalContext>;
  graphqlObjectType: GraphQLObjectType;
}> => {
  log(`creating object type for ${schema.name}`);

  // Create an empty field config map which will later be assigned fields
  // after graphql object type creation.
  const fieldConfigMap: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  // Create the graphql object type without any fields.
  const graphqlObjectType = new GraphQLObjectType({
    name: String(schema.name),
    fields: fieldConfigMap,
  });

  // Return both items
  return { fieldConfigMap, graphqlObjectType };
};

/**
 * Given the current config for a schema, create the corresponding input
 * type.
 *
 * @param config The configuration object containing all relevant data
 * for producing an InputObjectType
 */
const createGraphQLInputObjectTypesForSchema = async (
  config: ConfigBagItem,
): Promise<{
  create: GraphQLInputObjectType;
  update: GraphQLInputObjectType;
  delete: GraphQLInputObjectType;
}> => {
  const { schema } = config;

  const deleteInput = new GraphQLInputObjectType({
    name: `Delete${schema.name}InputType`,
    fields: {
      id: { type: GraphQLString },
    },
  });

  const createInputTypeFieldMap: GraphQLInputFieldConfigMap = {};
  const updateInputTypeFieldMap: GraphQLInputFieldConfigMap = {};

  await Promise.all(
    schema.fields.map(async field => {
      if (!field.dockiteField) {
        throw new Error(
          `dockiteField wasn't assigned to ${field.name} of ${schema.name} during load.`,
        );
      }

      // Resolves typescript dereferencing shenanigans
      const { dockiteField } = field;

      // Collect the GraphQL output type and arguments from the field.
      const inputType = await dockiteField.inputType({
        dockiteSchemas: config.schemas,
        dockiteFields: config.dockiteFieldsMap,
        graphqlTypes: config.objectTypeMap,
      });

      // Finally add the field to the map
      if (inputType !== null) {
        console.log({
          field: field.name,
          default: field.settings.default,
        });
        if (field.settings.required && field.settings.default === undefined) {
          createInputTypeFieldMap[field.name] = {
            type: GraphQLNonNull(inputType),
          };
        } else {
          createInputTypeFieldMap[field.name] = {
            type: inputType,
          };

          updateInputTypeFieldMap[field.name] = {
            type: inputType,
          };
        }
      }
    }),
  );

  const createInput = new GraphQLInputObjectType({
    name: `Create${schema.name}InputType`,
    fields: cloneDeep(createInputTypeFieldMap),
  });

  updateInputTypeFieldMap.id = {
    type: GraphQLNonNull(GraphQLString),
  };

  const updateInput = new GraphQLInputObjectType({
    name: `Update${schema.name}InputType`,
    fields: cloneDeep(updateInputTypeFieldMap),
  });

  return {
    create: createInput,
    update: updateInput,
    delete: deleteInput,
  };
};

const makeFieldsForGraphQLObjectType = async (fieldConfig: ConfigBagItem): Promise<void> => {
  const { schema, fieldConfigMap } = fieldConfig;

  // First we assign an id field to the schema which
  // will contain the document id
  fieldConfigMap.id = {
    type: GraphQLString,
  };

  // Next we attempt to assign each schema field to the object type
  await Promise.all(
    schema.fields.map(async field => {
      // If dockiteField isn't assigned something has gone horribly wrong.
      if (!field.dockiteField) {
        throw new Error(
          `dockiteField wasn't assigned to ${field.name} of ${schema.name} during load.`,
        );
      }

      // Resolves typescript dereferencing shenanigans
      const { dockiteField } = field;

      // Collect the GraphQL output type and arguments from the field.
      const [outputType, outputArgs] = await Promise.all([
        dockiteField.outputType({
          dockiteSchemas: fieldConfig.schemas,
          dockiteFields: fieldConfig.dockiteFieldsMap,
          graphqlTypes: fieldConfig.objectTypeMap,
        }),

        dockiteField.outputArgs(),
      ]);

      if (outputType !== null) {
        // Finally add the field to the map
        fieldConfigMap[field.name] = {
          type: outputType,
          args: outputArgs,
          resolve: async (data: Record<string, any>, args): Promise<any> => {
            const fieldData = data[field.name];

            return dockiteField.processOutputGraphQL<typeof outputType>({
              data,
              fieldData,
              field,
              args,
            });
          },
        };
      }
    }),
  );
};

const createGraphQLQueriesForSchema = async (
  config: ConfigBagItem,
): Promise<GraphQLFieldConfigMap<Source, GlobalContext>> => {
  const { schema, orm, graphqlObjectType } = config;

  const allQuery = `all${schema.name}`;
  const findQuery = `find${schema.name}`;
  const getQuery = `get${schema.name}`;

  const repository = orm.getRepository(Document);

  const findManyObjectType = new GraphQLObjectType({
    name: `Many${schema.name}`,
    fields: {
      results: { type: new GraphQLList(graphqlObjectType) },
      totalItems: { type: GraphQLInt },
      currentPage: { type: GraphQLInt },
      totalPages: { type: GraphQLInt },
      hasNextPage: { type: GraphQLBoolean },
    },
  });

  const queries: GraphQLFieldConfigMap<Source, GlobalContext> = {
    [getQuery]: {
      type: graphqlObjectType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_source, args, ctx, info): Promise<object> {
        const { id } = args;

        if (schema.settings.enableQueryAuthentication) {
          if (ctx.user) {
            const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

            if (
              !can(
                user.normalizedScopes,
                'internal:document:read',
                `schema:${schema.name.toLowerCase()}:read`,
              )
            ) {
              throw new Error('You are not authorized to perform this action');
            }
          } else {
            const authenticated = await isAuthenticatedAndAuthorized(config, ctx, info, getQuery);

            if (!authenticated) {
              throw new Error('You are not authorized to perform this action');
            }
          }
        }

        const document = await repository.findOneOrFail(id);

        return { id: document.id, ...document.data };
      },
    },

    [allQuery]: {
      type: findManyObjectType,
      description: schema.settings.description ?? `Retrieves all ${schema.name}`,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        perPage: { type: GraphQLInt, defaultValue: 25 },
        where: { type: WhereBuilderInputType },
        sort: { type: DockiteGraphqlSortInputType },
      },
      async resolve(_context, args, ctx, info): Promise<FindManyResult<any>> {
        const { sort, where, page, perPage } = args;

        if (schema.settings.enableQueryAuthentication) {
          if (ctx.user) {
            const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

            if (
              !can(
                user.normalizedScopes,
                'internal:document:read',
                `schema:${schema.name.toLowerCase()}:read`,
              )
            ) {
              throw new Error('You are not authorized to perform this action');
            }
          } else {
            const authenticated = await isAuthenticatedAndAuthorized(config, ctx, info, allQuery);

            if (!authenticated) {
              throw new Error('You are not authorized to perform this action');
            }
          }
        }

        const qb = repository
          .createQueryBuilder('document')
          .where('document.schemaId = :schemaId', { schemaId: schema.id });

        if (where) {
          WhereBuilder.Build(qb, where);
        }

        if (sort) {
          // Throw on any invalid input
          if (!/^[_A-Za-z][_0-9A-Za-z]*(\.[_A-Za-z][_0-9A-Za-z]*)*$/.test(sort.name)) {
            throw new Error('Invalid sorting name provided');
          }

          const columnPath = strToColumnPath(sort.name);

          // This handle the case where typeorm can't add abritary orderBy's to a query
          // by adding the column to order by to the select column we can avoid breaking typeorm
          // and successfully get our results.
          if (sort.name.startsWith('data')) {
            qb.addSelect(`document.${strToColumnPath(sort.name)}`, 'typeorm_sorter_fix');
            qb.orderBy('typeorm_sorter_fix', sort.direction);
          } else {
            qb.orderBy(`document.${columnPath}`, sort.direction);
          }
        } else {
          qb.orderBy('document.updatedAt', 'DESC');
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

    [findQuery]: {
      type: findManyObjectType,
      description: schema.settings.description ?? `Retrieves all ${schema.name}`,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        perPage: { type: GraphQLInt, defaultValue: 25 },
        where: { type: WhereBuilderInputType },
        sort: { type: DockiteGraphqlSortInputType },
      },
      async resolve(_context, args, ctx, info): Promise<FindManyResult<any>> {
        const { sort, where, page, perPage } = args;

        if (schema.settings.enableQueryAuthentication) {
          if (ctx.user) {
            const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

            if (
              !can(
                user.normalizedScopes,
                'internal:document:read',
                `schema:${schema.name.toLowerCase()}:read`,
              )
            ) {
              throw new Error('You are not authorized to perform this action');
            }
          } else {
            const authenticated = await isAuthenticatedAndAuthorized(config, ctx, info, allQuery);

            if (!authenticated) {
              throw new Error('You are not authorized to perform this action');
            }
          }
        }

        const qb = repository
          .createQueryBuilder('document')
          .where('document.schemaId = :schemaId', { schemaId: schema.id });

        if (where) {
          WhereBuilder.Build(qb, where);
        }

        if (sort) {
          // Throw on any invalid input
          if (!/^[_A-Za-z][_0-9A-Za-z]*(\.[_A-Za-z][_0-9A-Za-z]*)*$/.test(sort.name)) {
            throw new Error('Invalid sorting name provided');
          }

          const columnPath = strToColumnPath(sort.name);

          // This handle the case where typeorm can't add abritary orderBy's to a query
          // by adding the column to order by to the select column we can avoid breaking typeorm
          // and successfully get our results.
          if (sort.name.startsWith('data')) {
            qb.addSelect(`document.${strToColumnPath(sort.name)}`, 'typeorm_sorter_fix');
            qb.orderBy('typeorm_sorter_fix', sort.direction);
          } else {
            qb.orderBy(`document.${columnPath}`, sort.direction);
          }
        } else {
          qb.orderBy('document.updatedAt', 'DESC');
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

const createGraphQLQueriesForSingleton = async (
  config: ConfigBagItem,
): Promise<GraphQLFieldConfigMap<Source, GlobalContext>> => {
  const { schema, orm, graphqlObjectType } = config;

  const repository = orm.getRepository(Document);

  const queries: GraphQLFieldConfigMap<Source, GlobalContext> = {
    [schema.name]: {
      type: graphqlObjectType,
      async resolve(_source, _args, ctx, info): Promise<object> {
        if (schema.settings.enableQueryAuthentication) {
          if (ctx.user) {
            const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

            if (
              !can(
                user.normalizedScopes,
                'internal:document:read',
                `schema:${schema.name.toLowerCase()}:read`,
              )
            ) {
              throw new Error('You are not authorized to perform this action');
            }
          } else {
            const authenticated = await isAuthenticatedAndAuthorized(
              config,
              ctx,
              info,
              schema.name,
            );

            if (!authenticated) {
              throw new Error('You are not authorized to perform this action');
            }
          }
        }

        const [document] = await repository.find({
          take: 1,
        });

        return { id: document.id, ...document.data };
      },
    },
  };

  return queries;
};

const createGraphQLMutationsForSchema = async (
  config: ConfigBagItem,
): Promise<GraphQLFieldConfigMap<Source, GlobalContext>> => {
  const { schema, graphqlObjectType, orm } = config;

  const createMutation = `create${schema.name}`;
  const updateMutation = `update${schema.name}`;
  const deleteMutation = `delete${schema.name}`;

  const documentRepository = orm.getRepository(Document);
  const documentRevisionRepository = orm.getRepository(DocumentRevision);

  if (!anonymousUser) {
    anonymousUser = await orm.getRepository(User).findOneOrFail({
      where: { email: 'anonymous@dockite.app' },
    });
  }

  const mutations: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  if (schema.settings.enableMutations) {
    log(`creating mutations for ${schema.name}`);

    const inputTypes = await createGraphQLInputObjectTypesForSchema(config);

    if (schema.settings.enableCreateMutation) {
      mutations[createMutation] = {
        type: graphqlObjectType,
        args: {
          input: { type: inputTypes.create },
        },
        async resolve(_context, args, ctx, info): Promise<object> {
          let internalUserId = anonymousUser.id;
          let externalUserId = '';

          let { input } = args;

          input = {
            ...makeInitialFieldDataForDocument(schema.fields),
            ...input,
          };

          if (ctx.user) {
            internalUserId = ctx.user.id;

            const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

            if (
              !can(
                user.normalizedScopes,
                'internal:document:create',
                `schema:${schema.name.toLowerCase()}:create`,
              )
            ) {
              throw new Error('You are not authorized to perform this action');
            }
          } else {
            const authenticated = await isAuthenticatedAndAuthorized(
              config,
              ctx,
              info,
              createMutation,
            );

            if (!authenticated) {
              throw new Error('You are not authorized to perform this action');
            }

            externalUserId = String(authenticated);
          }

          await Promise.all(
            schema.fields.map(async field => {
              if (!field.dockiteField) {
                throw new Error(
                  `dockiteField wasn't assigned to ${field.name} of ${schema.name} during load.`,
                );
              }

              input[field.name] = await field.dockiteField.processInputGraphQL<any>({
                data: input,
                field,
                fieldData: input[field.name],
              });

              await field.dockiteField.validateInputGraphQL({
                data: input,
                fieldData: input[field.name],
                field,
              });

              await field.dockiteField.onCreate({
                data: input,
                fieldData: input[field.name],
                field,
              });
            }),
          );

          const document = documentRepository.create({
            data: omit(input, 'id'),
            locale: 'en-AU',
            schemaId: schema.id,
            userId: internalUserId,
            externalUserId,
          });

          const createdDocument = await documentRepository.save(document);

          return { ...createdDocument.data, id: createdDocument.id };
        },
      };
    }

    if (schema.settings.enableUpdateMutation) {
      mutations[updateMutation] = {
        type: graphqlObjectType,
        description: schema.settings.description ?? `Retrieves all ${schema.name}`,
        args: {
          input: { type: inputTypes.update },
        },
        async resolve(_context, args, ctx, info): Promise<object> {
          let { input } = args;

          try {
            let internalUserId = anonymousUser.id;
            let externalUserId = '';

            if (ctx.user) {
              internalUserId = ctx.user.id;

              const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

              if (
                !can(
                  user.normalizedScopes,
                  'internal:document:update',
                  `schema:${schema.name.toLowerCase()}:update`,
                )
              ) {
                throw new Error('You are not authorized to perform this action');
              }
            } else {
              const authenticated = await isAuthenticatedAndAuthorized(
                config,
                ctx,
                info,
                createMutation,
              );

              if (!authenticated) {
                throw new Error('You are not authorized to perform this action');
              }

              externalUserId = String(authenticated);
            }

            const document = await documentRepository.findOneOrFail(input.id);

            input = {
              ...document.data,
              ...input,
            };

            await Promise.all(
              schema.fields.map(async field => {
                if (!field.dockiteField) {
                  throw new Error(
                    `dockiteField wasn't assigned to ${field.name} of ${schema.name} during load.`,
                  );
                }

                input[field.name] = await field.dockiteField.processInputGraphQL<any>({
                  data: input,
                  field,
                  fieldData: input[field.name],
                  document,
                });

                await field.dockiteField.validateInputGraphQL({
                  data: input,
                  fieldData: input[field.name],
                  field,
                  oldData: cloneDeep(document.data),
                  document,
                });

                await field.dockiteField.onUpdate({
                  data: input,
                  fieldData: input[field.name],
                  field,
                  oldData: cloneDeep(document.data),
                  document,
                });
              }),
            );

            const revision = documentRevisionRepository.create({
              documentId: document.id,
              data: cloneDeep(document.data),
              userId: document.userId ?? '',
              schemaId: document.schemaId,
            });

            document.data = omit(input, 'id');
            document.userId = internalUserId;
            document.externalUserId = externalUserId;

            const [updatedDocument] = await Promise.all([
              documentRepository.save(document),
              documentRevisionRepository.save(revision),
            ]);

            return { ...updatedDocument.data, id: updatedDocument.id };
          } catch (err) {
            throw new Error(`The ${schema.title} with id: ${input.id} does not exist.`);
          }
        },
      };
    }

    if (schema.settings.enableDeleteMutation) {
      mutations[deleteMutation] = {
        type: graphqlObjectType,
        description: schema.settings.description ?? `Retrieves all ${schema.name}`,
        args: {
          input: { type: inputTypes.delete },
        },
        async resolve(_context, args, ctx, info): Promise<object> {
          const { input } = args;

          try {
            if (ctx.user) {
              const user = await orm.getRepository(User).findOneOrFail(ctx.user.id);

              if (
                !can(
                  user.normalizedScopes,
                  'internal:document:delete',
                  `schema:${schema.name.toLowerCase()}:delete`,
                )
              ) {
                throw new Error('You are not authorized to perform this action');
              }
            } else {
              const authenticated = await isAuthenticatedAndAuthorized(
                config,
                ctx,
                info,
                createMutation,
              );

              if (!authenticated) {
                throw new Error('You are not authorized to perform this action');
              }
            }

            const document = await documentRepository.findOneOrFail(input.id);

            await Promise.all(
              schema.fields.map(async field => {
                if (!field.dockiteField) {
                  throw new Error(
                    `dockiteField wasn't assigned to ${field.name} of ${schema.name} during load.`,
                  );
                }

                await field.dockiteField.onSoftDelete({
                  data: input,
                  fieldData: input[field.name],
                  field,
                  document,
                });
              }),
            );

            await documentRepository.remove(document);

            return { ...document.data, id: document.id };
          } catch (err) {
            throw new Error(`The ${schema.title} with id: ${input.id} does not exist.`);
          }
        },
      };
    }
  }

  return mutations;
};

export const createSchema = async (
  orm: typeof typeorm,
  schemas: Schema[],
  dockiteFieldsMap: Record<string, DockiteFieldStatic>,
  externalAuthenticationModule: {
    authenticated: (
      req: Express.Request,
      info: GraphQLResolveInfo,
      resolverName: string,
      schema: Schema,
    ) => MaybePromise<string | boolean>;
    authorized: (
      req: Express.Request,
      info: GraphQLResolveInfo,
      resolverName: string,
      schema: Schema,
    ) => MaybePromise<boolean>;
  },
): Promise<GraphQLSchema> => {
  const ObjectTypeMap = new Map<string, GraphQLObjectType>();
  const ConfigBag: ConfigBagItem[] = [];

  // First create a GraphQLObjectType for each schema
  // leaving its fields empty so they can be added afterwards.
  // This resolves any issues with fields needing to know and view
  // other schema object types during generation time.
  await Promise.all(
    schemas.map(async schema => {
      const result = await createGraphQLObjectTypeForSchema(schema);

      ObjectTypeMap.set(schema.name, result.graphqlObjectType);

      ConfigBag.push({
        schema,
        schemas,
        objectTypeMap: ObjectTypeMap,
        dockiteFieldsMap,
        orm,
        ...result,
        externalAuthenticationModule,
      });
    }),
  );

  await Promise.all(
    ConfigBag.map(async config => {
      await makeFieldsForGraphQLObjectType(config);
    }),
  );

  const SchemaConfigBag = ConfigBag.filter(config => config.schema.type === SchemaType.DEFAULT);
  const SingletonConfigBag = ConfigBag.filter(
    config => config.schema.type === SchemaType.SINGLETON,
  );

  const queryConfigCollection = await Promise.all([
    ...SchemaConfigBag.map(config => createGraphQLQueriesForSchema(config)),
    ...SingletonConfigBag.map(config => createGraphQLQueriesForSingleton(config)),
  ]);

  const mutationConfigCollection = await Promise.all(
    SchemaConfigBag.map(config => createGraphQLMutationsForSchema(config)),
  );

  const queryConfig = queryConfigCollection.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  const mutationConfig = mutationConfigCollection.reduce((acc, curr) => ({ ...acc, ...curr }), {});

  const schemaConfig: GraphQLSchemaConfig = {
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryConfig,
    }),
  };

  if (Object.keys(mutationConfig).length > 0) {
    schemaConfig.mutation = new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationConfig,
    });
  }

  return new GraphQLSchema(schemaConfig);
};
