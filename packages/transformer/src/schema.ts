/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import { Document, Schema, SchemaType } from '@dockite/database';
import {
  DockiteFieldValidationError,
  DockiteGraphqlSortInputType,
  GlobalContext,
  HookContextWithOldData,
  DockiteFieldStatic,
} from '@dockite/types';
import { WhereBuilder, WhereBuilderInputType } from '@dockite/where-builder';
import {
  GraphQLBoolean,
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  Source,
} from 'graphql';
import { cloneDeep, omit } from 'lodash';
import * as typeorm from 'typeorm';

import { DockiteSchemaError, DocumentValidationError } from './error';
import {
  DocumentMetadata,
  GetQueryArgs,
  AllQueryArgs,
  FindQueryArgs,
  CreateMutationArgs,
  UpdateMutationArgs,
  DeleteMutationArgs,
} from './types';
import { strToColumnPath } from './util';
import Auth from './auth';

export default class DockiteSchema {
  private schema: Schema;

  private canCreate = false;

  private canUpdate = false;

  private canDelete = false;

  private outputType: GraphQLObjectType | null = null;

  private manyResultsOutputType: GraphQLObjectType | null = null;

  private outputTypeFields: GraphQLFieldConfigMap<Source, GlobalContext> = {};

  private inputType: GraphQLInputObjectType | null = null;

  private inputTypeFields: GraphQLInputFieldConfigMap = {};

  constructor(schema: Schema) {
    if (!schema) {
      throw new DockiteSchemaError('Schema must be provided during class instantiation');
    }

    this.schema = schema;

    if (this.schema.settings.enableMutations) {
      this.canCreate = this.schema.settings.enableCreateMutation ?? false;
      this.canUpdate = this.schema.settings.enableUpdateMutation ?? false;
      this.canDelete = this.schema.settings.enableDeleteMutation ?? false;
    }
  }

  getName(): string {
    return this.schema.name;
  }

  /**
   * Creates the GraphQL Object type for a given schema within the database, assigning
   * the fields to an object that will later be populated so referential outputs can be
   * resolved.
   */
  public makeGraphQLOutputType(): GraphQLObjectType {
    const { name } = this.schema;

    if (this.outputType) {
      return this.outputType;
    }

    this.outputType = new GraphQLObjectType({
      name,
      fields: this.outputTypeFields,
    });

    return this.outputType;
  }

  /**
   * Creates the ManyResults type for a given GraphQL Object Type allowing
   * for the `many` and `all` queries to return a friendly result set.
   */
  private makeGraphQLManyResultsOutputType(): GraphQLObjectType {
    const { name } = this.schema;

    if (this.manyResultsOutputType) {
      return this.manyResultsOutputType;
    }

    this.manyResultsOutputType = new GraphQLObjectType({
      name: `Many${name}`,
      fields: {
        results: { type: GraphQLList(this.makeGraphQLOutputType()) },
        totalItems: { type: GraphQLInt },
        currentPage: { type: GraphQLInt },
        totalPages: { type: GraphQLInt },
        hasNextPage: { type: GraphQLBoolean },
      },
    });

    return this.manyResultsOutputType;
  }

  /**
   * Assigns the current schemas fields to it's corresponding GraphQL Object type.
   *
   * NOTE: This is performed in a separate step due to fields potentially requiring
   * knowledge of other GraphQL Object types.
   */
  public async assignGraphQLOutputTypeFields(
    dockiteFields: Record<string, DockiteFieldStatic>,
    dockiteSchemas: Schema[],
    graphqlTypes: Map<string, GraphQLObjectType>,
  ): Promise<void> {
    const { fields } = this.schema;

    await Promise.all(
      fields.map(async field => {
        field.setDockiteField();

        if (!field.dockiteField) {
          throw new DockiteSchemaError(
            `Unable to map DockiteField for "${field.name}" of ${this.schema.name}`,
          );
        }

        const type = await field.dockiteField.outputType({
          dockiteFields,
          dockiteSchemas,
          graphqlTypes,
        });

        const args = await field.dockiteField.outputArgs();

        if (type === null) {
          return;
        }

        this.outputTypeFields[field.name] = {
          type,
          args,
          description: field.description,
        };
      }),
    );

    this.outputTypeFields.id = {
      type: GraphQLString,
    };

    this.outputTypeFields._metadata = {
      type: DocumentMetadata,
    };
  }

  /**
   * Creates the GraphQL Input Object type for a given schema within the database,
   * assigning the fields to an object that will later be populated so referential
   * outputs can be resolved.
   */
  public makeGraphQLInputType(): GraphQLInputObjectType {
    const name = `${this.schema.name}InputType`;

    if (this.inputType) {
      return this.inputType;
    }

    this.inputType = new GraphQLInputObjectType({
      name,
      fields: this.inputTypeFields,
    });

    return this.inputType;
  }

  /**
   * Assigns the current schemas fields to it's corresponding GraphQL Input Object type.
   *
   * NOTE: This is performed in a separate step due to fields potentially requiring
   * knowledge of other GraphQL Object types.
   */
  public async assignGraphQLInputTypeFields(
    dockiteFields: Record<string, DockiteFieldStatic>,
    dockiteSchemas: Schema[],
    graphqlTypes: Map<string, GraphQLObjectType>,
  ): Promise<void> {
    const { fields } = this.schema;

    await Promise.all(
      fields.map(async field => {
        field.setDockiteField();

        if (!field.dockiteField) {
          throw new DockiteSchemaError(
            `Unable to map DockiteField for "${field.name}" of ${this.schema.name}`,
          );
        }

        const type = await field.dockiteField.inputType({
          dockiteFields,
          dockiteSchemas,
          graphqlTypes,
        });

        if (type === null) {
          return;
        }

        this.inputTypeFields[field.name] = {
          type,
          description: field.description,
        };
      }),
    );
  }

  /**
   * Creates the query types for a given schema with the neccessary get/find/all resolvers.
   *
   * @param orm {typeorm} The typeorm instance
   */
  public makeQueries(
    orm: typeof typeorm,
    auth: Auth,
  ): GraphQLFieldConfigMap<Source, GlobalContext> {
    const getItemQuery = `get${this.schema.name}`;
    const allItemsQuery = `all${this.schema.name}`;
    const findItemsQuery = `find${this.schema.name}`;

    if (this.schema.type === SchemaType.SINGLETON) {
      return {
        [this.schema.name]: this.makeSingletonQuery(orm, auth, this.schema.name),
      };
    }
    // We re-cast all entries since we want to benefit from additional type checking in the
    // individual functions
    return {
      [getItemQuery]: this.makeGetQuery(orm, auth, getItemQuery) as GraphQLFieldConfig<
        Source,
        GlobalContext
      >,
      [allItemsQuery]: this.makeAllQuery(orm, auth, allItemsQuery) as GraphQLFieldConfig<
        Source,
        GlobalContext
      >,
      [findItemsQuery]: this.makeFindQuery(orm, auth, findItemsQuery) as GraphQLFieldConfig<
        Source,
        GlobalContext
      >,
    };
  }

  /**
   * Creates the `[SINGLETON_NAME]` query.
   *
   * @param orm {typeorm} The typeorm instance
   */
  private makeSingletonQuery(
    orm: typeof typeorm,
    auth: Auth,
    name: string,
  ): GraphQLFieldConfig<Source, GlobalContext> {
    return {
      type: this.makeGraphQLOutputType(),
      resolve: async (_, _args, context, info): Promise<Record<string, any>> => {
        await auth.handle(context, info, name, this.schema);

        const repository = orm.getRepository(Document);

        const document = await repository.findOneOrFail({
          where: { schemaId: this.schema.id },
        });

        return { id: document.id, ...document.data, _metadata: cloneDeep(document) };
      },
    };
  }

  /**
   * Creates the `get[SCHEMA_NAME]` query with appropriate type-hinting for arguments passed
   * to the resolver.
   *
   * @param orm {typeorm} The typeorm instance
   */
  private makeGetQuery(
    orm: typeof typeorm,
    auth: Auth,
    name: string,
  ): GraphQLFieldConfig<Source, GlobalContext, GetQueryArgs> {
    return {
      type: this.makeGraphQLOutputType(),
      args: {
        id: {
          type: GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (_, args, context, info): Promise<Record<string, any>> => {
        await auth.handle(context, info, name, this.schema);

        if (!args.id) {
          throw new Error('Argument of `id` is required');
        }

        const repository = orm.getRepository(Document);

        const document = await repository.findOneOrFail({
          where: { id: args.id, schemaId: this.schema.id },
        });

        return { id: document.id, ...document.data, _metadata: cloneDeep(document) };
      },
    };
  }

  /**
   * Creates the `all[SCHEMA_NAME]` query with appropriate type-hinting for arguments passed
   * to the resolver.
   *
   * @param orm {typeorm} The typeorm instance
   */
  private makeAllQuery(
    orm: typeof typeorm,
    auth: Auth,
    name: string,
  ): GraphQLFieldConfig<Source, GlobalContext, AllQueryArgs> {
    return {
      type: this.makeGraphQLManyResultsOutputType(),
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        perPage: { type: GraphQLInt, defaultValue: 25 },
        where: { type: WhereBuilderInputType },
        sort: { type: DockiteGraphqlSortInputType },
      },
      resolve: async (_, args, context, info): Promise<Record<string, any>> => {
        const { sort, where, page, perPage } = args;

        await auth.handle(context, info, name, this.schema);

        const repository = orm.getRepository(Document);

        const qb = repository
          .createQueryBuilder('document')
          .where('document.schemaId = :schemaId', { schemaId: this.schema.id })
          .orderBy('document.updatedAt', 'DESC')
          .take(perPage)
          .skip(perPage * (page - 1));

        // Apply the where constraints if they've been provided
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
        }

        const [results, totalItems] = await qb.getManyAndCount();

        const totalPages = Math.ceil(totalItems / perPage);

        return {
          results: results.map(doc => ({ id: doc.id, ...doc.data, _metadata: cloneDeep(doc) })),
          totalItems,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
        };
      },
    };
  }

  /**
   * Creates the `find[SCHEMA_NAME]` query with appropriate type-hinting for arguments passed
   * to the resolver.
   *
   * @param orm {typeorm} The typeorm instance
   */
  private makeFindQuery(
    orm: typeof typeorm,
    auth: Auth,
    name: string,
  ): GraphQLFieldConfig<Source, GlobalContext, FindQueryArgs> {
    return this.makeAllQuery(orm, auth, name);
  }

  public makeMutations(
    orm: typeof typeorm,
    auth: Auth,
  ): GraphQLFieldConfigMap<Source, GlobalContext> {
    const createItemMutation = `create${this.schema.name}`;
    const updateItemMutation = `update${this.schema.name}`;
    const deleteItemMutation = `delete${this.schema.name}`;

    const fieldMap: GraphQLFieldConfigMap<Source, GlobalContext> = {};

    if (this.schema.type === SchemaType.SINGLETON) {
      return fieldMap;
    }

    if (this.canCreate) {
      // eslint-disable-next-line
      fieldMap[createItemMutation] = this.makeCreateMutation(orm, auth) as GraphQLFieldConfig<Source, GlobalContext>;
    }

    if (this.canUpdate) {
      // eslint-disable-next-line
      fieldMap[updateItemMutation] = this.makeUpdateMutation(orm, auth) as GraphQLFieldConfig<Source, GlobalContext>;
    }

    if (this.canDelete) {
      // eslint-disable-next-line
      fieldMap[deleteItemMutation] = this.makeDeleteMutation(orm, auth) as GraphQLFieldConfig<Source, GlobalContext>;
    }

    return fieldMap;
  }

  private makeCreateMutation(
    orm: typeof typeorm,
    auth: Auth,
  ): GraphQLFieldConfig<Source, GlobalContext, CreateMutationArgs> {
    // Retrieve the base input type for the schema.
    const baseInputType = this.makeGraphQLInputType();

    const name = `Create${baseInputType.name}`;

    // Extract the existing fields from the base input type.
    const createInputFields = { ...baseInputType.getFields() };

    // Create a new Input Object Type from the base type setting fields
    // to an object once again so we may modify them.
    const createInputType = new GraphQLInputObjectType({
      name,
      fields: createInputFields,
    });

    // For each field, identify any required fields or fields with default values
    // and set the corresponding GraphQL attributes so they are reflected in the
    // input type.
    this.schema.fields.forEach(field => {
      if (
        field.settings.default !== undefined &&
        field.settings.default !== null &&
        createInputFields[field.name]
      ) {
        createInputFields[field.name].defaultValue = field.settings.default;
      }

      if (field.settings.required && createInputFields[field.name]) {
        createInputFields[field.name].type = new GraphQLNonNull(createInputFields[field.name].type);
      }
    });

    // Finally create the field config for the mutation
    return {
      type: this.makeGraphQLOutputType(),
      args: {
        input: { type: createInputType },
      },
      resolve: async (_, args, context, info): Promise<Record<string, any>> => {
        let { input } = args;

        const authenticated = await auth.handle(context, info, name, this.schema);

        const repository = orm.getRepository(Document);

        input = {
          ...this.makeInitialFieldDataForDocument(),
          ...input,
        };

        await this.callLifeCycleHooks(input, 'processInputGraphQL', true);

        await this.callLifeCycleHooks(input, 'validateInputGraphQL');

        await this.callLifeCycleHooks(input, 'onCreate');

        const document = await repository.create({
          data: omit(input, 'id'),
          locale: 'en-AU',
          schemaId: this.schema.id,
        });

        document.userId = authenticated.internalUser.id;

        if (authenticated.externalUser) {
          document.externalUserId = authenticated.externalUser;
        }

        const createdDocument = await repository.save(document);

        return {
          ...createdDocument.data,
          id: createdDocument.id,
          _metadata: cloneDeep(createdDocument),
        };
      },
    };
  }

  private makeUpdateMutation(
    orm: typeof typeorm,
    auth: Auth,
  ): GraphQLFieldConfig<Source, GlobalContext, UpdateMutationArgs> {
    // Retrieve the base input type for the schema.
    const baseInputType = this.makeGraphQLInputType();

    const name = `Update${baseInputType.name}`;

    // Extract the existing fields from the base input type and append the ID field.
    const updateInputFields = {
      ...baseInputType.getFields(),
      id: { type: new GraphQLNonNull(GraphQLString) },
    };

    // Create a new Input Object Type from the base type setting fields
    // to an object once again so we may modify them.
    const updateInputType = new GraphQLInputObjectType({
      name,
      fields: updateInputFields,
    });

    // Finally create the field config for the mutation
    return {
      type: this.makeGraphQLOutputType(),
      args: {
        input: { type: updateInputType },
      },
      resolve: async (_, args, context, info): Promise<Record<string, any>> => {
        let { input } = args;

        const authenticated = await auth.handle(context, info, name, this.schema);

        const repository = orm.getRepository(Document);

        const document = await repository.findOneOrFail({
          where: {
            id: input.id,
            schemaId: this.schema.id,
          },
        });

        input = {
          ...this.makeInitialFieldDataForDocument(),
          ...cloneDeep(document.data),
          ...input,
        };

        await this.callLifeCycleHooks(input, 'processInputGraphQL', true);

        await this.callLifeCycleHooks(input, 'validateInputGraphQL');

        await this.callLifeCycleHooks(input, 'onUpdate');

        document.data = omit(input, 'id');

        document.userId = authenticated.internalUser.id;

        if (authenticated.externalUser) {
          document.externalUserId = authenticated.externalUser;
        }

        const updatedDocument = await repository.save(document);

        return {
          ...updatedDocument.data,
          id: updatedDocument.id,
          _metadata: cloneDeep(updatedDocument),
        };
      },
    };
  }

  private makeDeleteMutation(
    orm: typeof typeorm,
    auth: Auth,
  ): GraphQLFieldConfig<Source, GlobalContext, DeleteMutationArgs> {
    const baseInputType = this.makeGraphQLInputType();

    const name = `Delete${baseInputType.name}`;

    // Create a new Input Object Type from the base type setting fields
    // to an object once again so we may modify them.
    const deleteInputType = new GraphQLInputObjectType({
      name,
      fields: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
    });

    // Finally create the field config for the mutation
    return {
      type: GraphQLBoolean,
      args: {
        input: { type: deleteInputType },
      },
      resolve: async (_, args, context, info): Promise<boolean> => {
        const { input } = args;

        const authenticated = await auth.handle(context, info, name, this.schema);

        const repository = orm.getRepository(Document);

        const document = await repository.findOneOrFail({
          where: {
            id: input.id,
            schemaId: this.schema.id,
          },
        });

        await this.callLifeCycleHooks(input, 'onSoftDelete');

        document.userId = authenticated.internalUser.id;

        if (authenticated.externalUser) {
          document.externalUserId = authenticated.externalUser;
        }

        await repository.softRemove(document);

        return true;
      },
    };
  }

  private makeInitialFieldDataForDocument(): Record<string, any> {
    return this.schema.fields.reduce((root, field) => {
      // Prioritise getting the default value from user configuration
      let defaultValue = field.settings.default;

      // Otherwise default to field level defaults
      if (defaultValue === undefined && field.dockiteField) {
        defaultValue = field.dockiteField.defaultValue();
      }

      // Finally if there is no provided default value set the value to null
      if (defaultValue === undefined) {
        defaultValue = null;
      }

      return {
        ...root,
        [field.name]: defaultValue,
      };
    }, {});
  }

  private async callLifeCycleHooks(
    data: Record<string, any>,
    hook:
      | 'processInputGraphQL'
      | 'onCreate'
      | 'onUpdate'
      | 'onSoftDelete'
      | 'onPermanentDelete'
      | 'validateInputGraphQL',
    mutates = false,
    document?: Document,
    oldData?: Record<string, any>,
  ): Promise<void> {
    const validationErrors: Record<string, string> = {};

    await Promise.all(
      this.schema.fields.map(async field => {
        if (!field.dockiteField) {
          throw new Error(`Unable to map DockiteField for "${field.name}" of ${this.schema.name}`);
        }

        // Skip fields which don't exist (resolves bulk-update issues)
        if (data[field.name] === undefined) {
          return;
        }

        const fieldData = data[field.name] ?? null;

        const hookContext: HookContextWithOldData = {
          field,
          fieldData,
          data,
          oldData,
          document,
          path: field.name,
        };

        try {
          if (mutates) {
            data[field.name] = await field.dockiteField[hook](hookContext);
          } else {
            await field.dockiteField[hook](hookContext);
          }
        } catch (err) {
          if (err instanceof DockiteFieldValidationError) {
            validationErrors[err.path] = err.message;

            if (err.children) {
              err.children.forEach(e => {
                validationErrors[e.path] = e.message;
              });
            }

            throw new DocumentValidationError(validationErrors);
          }
        }
      }),
    );
  }
}
