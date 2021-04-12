/* eslint-disable class-methods-use-this */
import debug from 'debug';
import { cloneDeep, groupBy, omit, result, uniq } from 'lodash';
import { Arg, Args, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getRepository, In, IsNull, Not, Repository } from 'typeorm';

import { Field, Schema, SchemaRevision, SchemaType } from '@dockite/database';
import { GlobalContext } from '@dockite/types';

import { MAX_32_BIT_INT } from '../../../../common/constants';
import { Authenticated, Authorized } from '../../../../common/decorators';
import { createFindManyResult } from '../document/util';

import {
  AllSchemasArgs,
  CreateSchemaArgs,
  DeleteSchemaArgs,
  GetSchemaByIdArgs,
  ImportSchemaArgs,
  RestoreSchemaArgs,
  UpdateSchemaArgs,
} from './args';
import { FindManySchemasResult } from './types';
import {
  getCreatedSchemaFieldsFromPayload,
  getDeletedSchemaFieldsFromPayload,
  getRenamedSchemaFieldsFromPayload,
  mapPayloadFieldsToSchemaFields,
  reviseAllDocumentsForSchema,
  updateDocumentsWithFieldChanges,
} from './util';

const log = debug('dockite:core:resolvers:schema');

/**
 *
 */
@Resolver(_of => Schema)
export class SchemaResolver {
  private schemaRepository: Repository<Schema>;

  private schemaRevisionRepository: Repository<SchemaRevision>;

  private fieldRepository: Repository<Field>;

  constructor() {
    this.schemaRepository = getRepository(Schema);

    this.schemaRevisionRepository = getRepository(SchemaRevision);

    this.fieldRepository = getRepository(Field);
  }

  /**
   * CRUD RESOLVERS
   */

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:read',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['id', 'schemaId'],
  })
  @Query(_returns => Schema)
  public async getSchema(
    @Args()
    input: GetSchemaByIdArgs,
  ): Promise<Schema> {
    const { id, deleted } = input;

    try {
      const qb = this.schemaRepository
        .createQueryBuilder('schema')
        .where('schema.id = :id', { id })
        .andWhere('schema.type = :schemaType', { schemaType: SchemaType.DEFAULT })
        .leftJoinAndSelect('schema.user', 'user');

      if (deleted) {
        qb.andWhere('schema.deletedAt IS NOT NULL').withDeleted();
      }

      const [schema, fields] = await Promise.all([
        qb.getOneOrFail(),
        this.fieldRepository.find({ where: { schemaId: id } }),
      ]);

      schema.fields = fields;

      return schema;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve schema with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:read',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['id', 'schemaId'],
  })
  @Query(_returns => FindManySchemasResult, { name: 'findSchemas' })
  @Query(_returns => FindManySchemasResult)
  public async allSchemas(
    @Args()
    input: AllSchemasArgs,
  ): Promise<FindManySchemasResult> {
    const { deleted } = input;

    const qb = this.schemaRepository
      .createQueryBuilder('schema')
      .where('schema.type = :schemaType', { schemaType: SchemaType.DEFAULT })
      .leftJoinAndSelect('schema.user', 'user');

    if (deleted) {
      qb.andWhere('schema.deletedAt IS NOT NULL').withDeleted();
    }

    const [schemas, count] = await qb.getManyAndCount();

    const fields = await this.fieldRepository
      .find({
        where: { schemaId: In(uniq(schemas.map(s => s.id))) },
      })
      .then(result => groupBy(result, 'schemaId'));

    schemas.forEach(schema => {
      Object.assign(schema, {
        fields: fields[schema.id],
      });
    });

    return createFindManyResult<Schema>(schemas, count, 1, MAX_32_BIT_INT);
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:create',
  })
  @Mutation(_returns => Schema)
  public async createSchema(
    @Arg('input', _type => CreateSchemaArgs, { validate: true })
    input: CreateSchemaArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema> {
    const { name, title, groups, settings } = input;

    try {
      const matched = await this.schemaRepository.find({
        where: { name },
        withDeleted: true,
      });

      if (matched && matched.length > 0) {
        throw new Error('Schema name provided is not unique');
      }

      const schema = await this.schemaRepository.save({
        name,
        title,
        type: SchemaType.DEFAULT,
        groups,
        settings,
        userId: ctx.user?.id,
      });

      return schema;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to create the schema');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Schema)
  public async updateSchema(
    @Arg('input', _type => UpdateSchemaArgs, { validate: true })
    input: UpdateSchemaArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema> {
    const { id, name, title, groups, settings } = input;

    try {
      const [schema, fields] = await Promise.all([
        this.schemaRepository.findOneOrFail({
          where: { id },
          relations: ['user'],
        }),
        this.fieldRepository.find({ where: { schemaId: id } }),
      ]);

      schema.fields = fields;

      // Clone the retrieved schema but omit the `dockiteField` property from the retrieved fields
      // to avoid circular dependencies during serialization
      const clonedSchema = cloneDeep({
        ...schema,
        fields: schema.fields.map(field => omit(field, 'dockiteField')),
      });

      const [updatedSchema] = await Promise.all([
        this.schemaRepository.save({
          ...schema,
          name: name || schema.name,
          title: title || schema.title,
          groups,
          settings,
        }),
        this.schemaRevisionRepository.save({
          schemaId: schema.id,
          data: clonedSchema,
          updatedAt: schema.updatedAt,
          userId: ctx.user?.id,
        }),
      ]);

      return updatedSchema;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to update the schema');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:delete',
  })
  @Mutation(_returns => Boolean)
  public async deleteSchema(
    @Arg('input', _type => DeleteSchemaArgs)
    input: DeleteSchemaArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const [schema, fields] = await Promise.all([
        this.schemaRepository.findOneOrFail({
          where: { id },
          relations: ['user'],
        }),
        this.fieldRepository.find({ where: { schemaId: id } }),
      ]);

      schema.fields = fields;

      // Clone the retrieved schema but omit the `dockiteField` property from the retrieved fields
      // to avoid circular dependencies during serialization
      const clonedSchema = cloneDeep({
        ...schema,
        fields: schema.fields.map(field => omit(field, 'dockiteField')),
      });

      await Promise.all([
        // We `omit` the fields here since typeorm will try to recusrively soft delete them
        this.schemaRepository.softRemove(omit(schema, 'fields')),
        this.schemaRevisionRepository.save({
          schemaId: schema.id,
          data: clonedSchema,
          updatedAt: schema.updatedAt,
          userId: ctx.user?.id,
        }),
      ]);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:delete',
  })
  @Mutation(_returns => Boolean)
  public async permanentlyDeleteSchema(
    @Arg('input', _type => DeleteSchemaArgs)
    input: DeleteSchemaArgs,
    @Ctx()
    _ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const [schema, fields, revisions] = await Promise.all([
        this.schemaRepository.findOneOrFail({
          where: { id, deletedAt: Not(IsNull()) },
          relations: ['user'],
          withDeleted: true,
        }),
        this.fieldRepository.find({ where: { schemaId: id } }),
        this.schemaRevisionRepository.find({ where: { schemaId: id } }),
      ]);

      schema.fields = fields;

      await Promise.all([
        this.schemaRepository.remove(schema),
        this.schemaRevisionRepository.remove(revisions),
      ]);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Schema)
  public async restoreSchema(
    @Arg('input', _type => RestoreSchemaArgs)
    input: RestoreSchemaArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema> {
    const { id } = input;

    try {
      const [schema, fields] = await Promise.all([
        this.schemaRepository.findOneOrFail({
          where: { id },
          relations: ['fields', 'user'],
          withDeleted: true,
        }),
        this.fieldRepository.find({ where: { schemaId: id } }),
      ]);

      // Clone the retrieved schema but omit the `dockiteField` property from the retrieved fields
      // to avoid circular dependencies during serialization
      const clonedSchema = cloneDeep({
        ...schema,
        fields: schema.fields.map(field => omit(field, 'dockiteField')),
      });

      const [restoredSchema] = await Promise.all([
        this.schemaRepository.recover(schema),
        this.schemaRevisionRepository.save({
          schemaId: schema.id,
          data: clonedSchema,
          updatedAt: schema.updatedAt,
          userId: ctx.user?.id,
        }),
      ]);

      return restoredSchema;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to restore the schema');
    }
  }

  /**
   * EXTRA RESOLVERS
   */
  @Authenticated()
  @Authorized({
    scope: 'internal:schema:update',
  })
  @Mutation(_returns => Schema)
  public async importSchema(
    @Arg('input', _type => ImportSchemaArgs)
    input: ImportSchemaArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema> {
    // TODO: Add the Ajv validation from the @dockite/database package
    const { id, payload } = input;

    try {
      if (typeof payload !== 'object') {
        throw new Error('Provided payload was not an object');
      }

      const promises: Promise<any>[] = [];

      let schema = new Schema();

      // If a schema id has been provided, fetch the schema failing if there are no matches
      if (id || payload.id) {
        schema = await this.schemaRepository.findOneOrFail({
          where: {
            id: id ?? payload.id,
          },
          relations: ['user'],
        });

        const fields = await this.fieldRepository.find({ where: { schemaId: schema.id } });

        schema.fields = fields;

        const clonedSchema = cloneDeep({
          ...schema,
          fields: schema.fields.map(field => omit(field, 'dockiteField')),
        });

        promises.push(
          this.schemaRevisionRepository.save({
            schemaId: schema.id,
            data: clonedSchema,
            updatedAt: schema.updatedAt,
            userId: ctx.user?.id,
          }),
        );
      }

      // Retrieve the schemas fields defaulting to an empty array
      const schemaFields = cloneDeep(schema.fields ?? []);

      // Map the provided fields from the payload to a relevant schema field if possible
      const fieldsToImport = mapPayloadFieldsToSchemaFields(schemaFields, payload.fields);

      // If we were able to retrieve a schema, perform calculations on which fields have been modified
      // and update the corresponding documents
      if (schema.id) {
        const fieldsThatHaveBeenRenamed = getRenamedSchemaFieldsFromPayload(
          schemaFields,
          fieldsToImport,
        );

        const fieldsThatHaveBeenDeleted = getDeletedSchemaFieldsFromPayload(
          schemaFields,
          fieldsToImport,
        );

        const fieldsThatHaveBeenCreated = getCreatedSchemaFieldsFromPayload(
          schemaFields,
          fieldsToImport,
        );

        const fieldDeletionPromise = this.fieldRepository.remove(fieldsThatHaveBeenDeleted);

        await reviseAllDocumentsForSchema(schema, ctx.user?.id || null);

        await updateDocumentsWithFieldChanges(
          schema,
          fieldsThatHaveBeenRenamed,
          fieldsThatHaveBeenDeleted,
          fieldsThatHaveBeenCreated,
        );

        await fieldDeletionPromise;
      }

      if (!Array.isArray(payload.groups) && typeof payload.groups === 'object') {
        payload.groups = Object.entries(payload.groups).map(([key, value]) => ({ [key]: value }));
      }

      // Assign the payload values to the schema
      Object.assign(schema, omit(payload, 'fields', 'createdAt', 'updatedAt', 'deletedAt'));

      // Save the schema
      const savedSchema = await this.schemaRepository.save(schema);

      // Set the schemas fields the mapped fields
      const savedFields = await this.fieldRepository.save(
        fieldsToImport.map(f => ({ ...f, schemaId: savedSchema.id })),
      );

      return { ...savedSchema, fields: savedFields };
    } catch (err) {
      log(err);

      throw err;

      throw new Error('An error occurred while importing your schema');
    }
  }

  /**
   * Outputs groups in a PWA friendly manner
   */
  @FieldResolver()
  protected groups(
    @Root()
    schema: Schema,
  ): Record<string, string[]> {
    const groups = {};

    const schemaGroups = schema.groups as Array<Record<string, string[]>>;

    schemaGroups.forEach(schemaGroup => {
      Object.assign(groups, schemaGroup);
    });

    return groups;
  }
}

export default SchemaResolver;
