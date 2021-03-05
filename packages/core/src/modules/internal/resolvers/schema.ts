import {
  Document,
  Schema,
  SchemaImportRepository,
  SchemaRevision,
  SchemaType,
} from '@dockite/database';
import { GlobalContext } from '@dockite/types';
import { AuthenticationError, ValidationError } from 'apollo-server-express';
import { GraphQLError } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { cloneDeep, omit } from 'lodash';
import {
  Arg,
  Ctx,
  Field as GraphQLField,
  FieldResolver,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { getCustomRepository, getRepository, IsNull, Not } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { DockiteEvents } from '../../../events';
import { validator as schemaImportValidator } from '../validation/schema-import';

@ObjectType()
class ManySchemas {
  @GraphQLField(_type => [Schema])
  results!: Schema[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => Schema)
export class SchemaResolver {
  @Authenticated()
  @Authorized('internal:schema:read')
  @Query(_returns => Schema, { nullable: true })
  async getSchema(
    @Arg('id', _type => String, { nullable: true })
    id: string | null,
    @Arg('name', _type => String, { nullable: true })
    name: string | null,
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean | null,
  ): Promise<Schema | null> {
    const repository = getRepository(Schema);

    let schema;

    if (id) {
      schema = await repository.findOne({
        relations: ['fields'],
        where: { id, type: SchemaType.DEFAULT, deletedAt: deleted ? Not(IsNull()) : null },
        withDeleted: !!deleted,
      });
    } else if (name) {
      schema = await repository.findOne({
        relations: ['fields'],
        where: { name, type: SchemaType.DEFAULT, deletedAt: deleted ? Not(IsNull()) : null },
        withDeleted: !!deleted,
      });
    }

    if (!schema) {
      return null;
    }

    return schema;
  }

  @Authenticated()
  @Authorized('internal:schema:read')
  @Query(_returns => ManySchemas)
  async allSchemas(
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean,
  ): Promise<ManySchemas> {
    const repository = getRepository(Schema);

    const [results, totalItems] = await repository.findAndCount({
      where: { deletedAt: deleted ? Not(IsNull()) : null, type: SchemaType.DEFAULT },
      relations: ['fields'],
      withDeleted: !!deleted,
    });

    return {
      results,
      currentPage: 1,
      totalItems,
      totalPages: 1,
      hasNextPage: false,
    };
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Authorized('internal:schema:create', { derriveAlternativeScopes: false })
  @Mutation(_returns => Schema)
  async createSchema(
    @Arg('name')
    name: string,
    @Arg('title', _type => String)
    title: string,
    @Arg('type', _type => SchemaType)
    type: SchemaType,
    @Arg('groups', _type => GraphQLJSON)
    groups: any, // eslint-disable-line
    @Arg('settings', _type => GraphQLJSON)
    settings: any, // eslint-disable-line
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema | null> {
    const repository = getRepository(Schema);

    const { user } = ctx;

    if (!user) {
      throw new GraphQLError('User not found');
    }

    if (!Object.values(SchemaType).includes(type as SchemaType)) {
      throw new Error('SchemaType provided is invalid');
    }

    const preservedGroups = Object.keys(groups).map(key => ({ [key]: groups[key] }));

    const schema = repository.create({
      name,
      title,
      type,
      groups: preservedGroups,
      settings,
      userId: user.id,
    });

    const savedSchema = await repository.save(schema);

    DockiteEvents.emit('reload');

    return savedSchema;
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Authorized('internal:schema:update', { derriveAlternativeScopes: false })
  @Mutation(_returns => Schema)
  async updateSchema(
    @Arg('id')
    id: string,
    @Arg('title', _type => String, { nullable: true })
    title: string | null,
    @Arg('groups', _type => GraphQLJSON)
    groups: any, // eslint-disable-line
    @Arg('settings', _type => GraphQLJSON)
    settings: any, // eslint-disable-line
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema | null> {
    const repository = getRepository(Schema);

    const { user } = ctx;

    if (!user) {
      throw new GraphQLError('User not found');
    }

    const schema = await repository.findOneOrFail({
      where: { id, type: SchemaType.DEFAULT },
    });

    if (title) {
      schema.title = title;
    }

    const preservedGroups = Object.keys(groups).map(key => ({ [key]: groups[key] }));

    schema.groups = preservedGroups;
    schema.settings = settings;

    await this.createRevision(schema.id, user.id);

    const savedSchema = await repository.save(schema);

    DockiteEvents.emit('reload');

    return savedSchema;
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Authorized('internal:schema:import', { derriveAlternativeScopes: false })
  @Mutation(_returns => Schema)
  async importSchema(
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
    @Arg('payload', _type => GraphQLJSON)
    payload: Schema, // eslint-disable-line
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Schema | null> {
    const schemaImportRepository = getCustomRepository(SchemaImportRepository);
    const schemaRepository = getRepository(Schema);

    const clonedPayload = cloneDeep(payload);

    clonedPayload.type = SchemaType.DEFAULT;

    // If we're provided an Object comprising of the groups and fields then we will map them back to
    // an array of objects
    if (!Array.isArray(clonedPayload.groups) && typeof clonedPayload.groups === 'object') {
      clonedPayload.groups = Object.entries(clonedPayload.groups).map(([groupName, fields]) => {
        return {
          [groupName]: fields,
        };
      });
    }

    const valid = schemaImportValidator(clonedPayload);

    if (!valid) {
      console.log(schemaImportValidator.errors);
      throw new ValidationError('Payload provided is invalid');
    }

    if (!ctx.user) {
      throw new AuthenticationError('Not authenticated');
    }

    const importedSchema = await schemaImportRepository.importSchema(
      schemaId,
      clonedPayload,
      ctx.user.id,
    );

    if (!importedSchema) {
      throw new Error('Error importing schema');
    }

    DockiteEvents.emit('reload');

    return schemaRepository.findOneOrFail(importedSchema.id, { relations: ['fields'] });
  }

  /**
   * TODO: Possibly add a check for if the Schema exists and throw
   */
  @Authenticated()
  @Authorized('internal:schema:delete', { derriveAlternativeScopes: false })
  @Mutation(_returns => Boolean)
  async removeSchema(
    @Arg('id')
    id: string,
  ): Promise<boolean> {
    const schemaRepository = getRepository(Schema);
    const documentRepository = getRepository(Document);

    try {
      const [schema, documents] = await Promise.all([
        schemaRepository.findOneOrFail({ where: { id, type: SchemaType.DEFAULT } }),
        documentRepository.find({ where: { schemaId: id } }),
      ]);

      await Promise.all([
        schemaRepository.softRemove(schema),
        documentRepository.softRemove(documents),
      ]);

      DockiteEvents.emit('reload');

      return true;
    } catch {
      return false;
    }
  }

  @FieldResolver()
  protected groups(@Root() schema: Schema): Record<string, string[]> {
    return schema.groups.reduce((acc: Record<string, string[]>, curr: Record<string, string[]>) => {
      return {
        ...acc,
        ...curr,
      };
    }, {});
  }

  private async createRevision(id: string, userId: string): Promise<void> {
    const schemaRepository = getRepository(Schema);
    const revisionRepository = getRepository(SchemaRevision);

    const previousSchema = await schemaRepository.findOneOrFail(id, { relations: ['fields'] });

    // We need to remove the dockiteField class that's loaded as it contains circular data.
    previousSchema.fields = previousSchema.fields.map(field => omit(field, 'dockiteField'));

    const revision = revisionRepository.create({
      data: previousSchema as Record<string, any>,
      schemaId: id,
      userId: userId ?? null,
    });

    await revisionRepository.save(revision);
  }
}
