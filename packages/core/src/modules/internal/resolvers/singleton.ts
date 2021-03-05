import {
  Document,
  DocumentRevision,
  Field,
  Schema,
  SchemaImportRepository,
  SchemaRevision,
  SchemaType,
  Singleton,
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
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getCustomRepository, getRepository, IsNull, Not } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { DockiteEvents } from '../../../events';
import { validator as schemaImportValidator } from '../validation/schema-import';

@ObjectType()
class ManySingletons {
  @GraphQLField(_type => [Singleton])
  results!: Singleton[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => Singleton)
export class SingletonResolver {
  @Authenticated()
  @Authorized('internal:schema:read')
  @Query(_returns => Singleton, { nullable: true })
  async getSingleton(
    @Arg('id', _type => String, { nullable: true })
    id: string | null,
    @Arg('name', _type => String, { nullable: true })
    name: string | null,
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean | null,
  ): Promise<Singleton | null> {
    const schemaRepository = getRepository(Schema);
    const documentRepository = getRepository(Document);

    let schema;

    if (id) {
      schema = await schemaRepository.findOne({
        relations: ['fields'],
        where: { id, type: SchemaType.SINGLETON, deletedAt: deleted ? Not(IsNull()) : null },
        withDeleted: !!deleted,
      });
    } else if (name) {
      schema = await schemaRepository.findOne({
        relations: ['fields'],
        where: { name, type: SchemaType.SINGLETON, deletedAt: deleted ? Not(IsNull()) : null },
        withDeleted: !!deleted,
      });
    }

    if (!schema) {
      return null;
    }

    const document = await documentRepository.findOneOrFail({ where: { schemaId: schema.id } });

    return { ...schema, data: document.data };
  }

  @Authenticated()
  @Authorized('internal:schema:read')
  @Query(_returns => ManySingletons)
  async allSingletons(
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean | null,
  ): Promise<ManySingletons> {
    const repository = getRepository(Schema);

    const [results, totalItems] = await repository.findAndCount({
      where: { deletedAt: deleted ? Not(IsNull()) : null, type: SchemaType.SINGLETON },
      relations: ['fields', 'documents'],
      withDeleted: !!deleted,
    });

    return {
      results: results.map(schemaWithDocuments => ({
        ...schemaWithDocuments,
        data: schemaWithDocuments.documents[0].data,
      })),
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
  @Mutation(_returns => Singleton)
  async createSingleton(
    @Arg('name')
    name: string,
    @Arg('title', _type => String)
    title: string,
    @Arg('groups', _type => GraphQLJSON)
    groups: any,
    @Arg('settings', _type => GraphQLJSON)
    settings: any,
    @Arg('data', _type => GraphQLJSON)
    data: any,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton | null> {
    const schemaRepository = getRepository(Schema);
    const documentRepository = getRepository(Document);

    const { user } = ctx;

    if (!user) {
      throw new GraphQLError('User not found');
    }

    const preservedGroups = Object.keys(groups).map(key => ({ [key]: groups[key] }));

    const schema = schemaRepository.create({
      name,
      title,
      type: SchemaType.SINGLETON,
      groups: preservedGroups,
      settings,
      userId: user.id,
    });

    const savedSchema = await schemaRepository.save(schema);

    const document = documentRepository.create({
      data,
      locale: 'en-AU',
      userId: user.id,
      schemaId: savedSchema.id,
    });

    const savedDocument = await documentRepository.save(document);

    DockiteEvents.emit('reload');

    return { ...savedSchema, data: savedDocument.data };
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Authorized('internal:schema:update', {
    derriveAlternativeScopes: true,
    checkArgs: true,
    fieldsOrArgsToPeek: ['id'],
  })
  @Mutation(_returns => Singleton)
  async updateSingleton(
    @Arg('id')
    id: string,
    @Arg('title', _type => String, { nullable: true })
    title: string | null,
    @Arg('groups', _type => GraphQLJSON)
    groups: any,
    @Arg('settings', _type => GraphQLJSON)
    settings: any,
    @Arg('data', _type => GraphQLJSON)
    data: any,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton | null> {
    const schemaRepository = getRepository(Schema);
    const documentRepository = getRepository(Document);
    const documentRevisionRepository = getRepository(DocumentRevision);

    const { user } = ctx;

    if (!user) {
      throw new GraphQLError('User not found');
    }

    const [schema, document] = await Promise.all([
      schemaRepository.findOneOrFail({
        where: { id, type: SchemaType.SINGLETON },
      }),
      documentRepository.findOneOrFail({
        where: { schemaId: id },
      }),
    ]);

    if (title) {
      schema.title = title;
    }

    const preservedGroups = Object.keys(groups).map(key => ({ [key]: groups[key] }));

    schema.groups = preservedGroups;
    schema.settings = settings;

    schema.updatedAt = new Date();

    if (data) {
      const revision = documentRevisionRepository.create({
        documentId: document.id,
        data: cloneDeep(document.data),
        userId: document.userId ?? '',
        schemaId: document.schemaId,
      });

      await documentRevisionRepository.save(revision);

      document.data = data;
      document.userId = user.id;
    }

    await this.createRevision(schema.id, user.id);

    await Promise.all([schemaRepository.save(schema), documentRepository.save(document)]);

    DockiteEvents.emit('reload');

    return { ...schema, data: document.data };
  }

  /**
   * TODO: Perform light validation on fields, settings, groups
   */
  @Authenticated()
  @Authorized('internal:schema:import', { derriveAlternativeScopes: false })
  @Mutation(_returns => Singleton)
  async importSingleton(
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
    @Arg('payload', _type => GraphQLJSON)
    payload: Schema,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton | null> {
    const { user } = ctx;

    if (!user) {
      throw new GraphQLError('User not found');
    }

    const schemaImportRepository = getCustomRepository(SchemaImportRepository);
    const documentRepository = getRepository(Document);
    const schemaRepository = getRepository(Schema);

    const clonedPayload: Schema = cloneDeep(payload);

    clonedPayload.type = SchemaType.SINGLETON;

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

    const importedSingleton = await schemaImportRepository.importSchema(
      schemaId,
      clonedPayload,
      ctx.user.id,
    );

    if (!importedSingleton) {
      throw new Error('Singleton failed to be imported');
    }

    const singleton = await schemaRepository.findOneOrFail(importedSingleton.id, {
      relations: ['fields'],
    });

    try {
      const document = await documentRepository.findOneOrFail({
        where: { schemaId: singleton.id },
      });

      return { ...singleton, data: document.data };
    } catch (_) {
      const document = documentRepository.create({
        data: this.makeInitialSingletonData(singleton.fields),
        locale: 'en-AU',
        userId: user.id,
        schemaId: singleton.id,
      });

      await documentRepository.save(document);

      return { ...singleton, data: document.data };
    }
  }

  /**
   * TODO: Possibly add a check for if the Schema exists and throw
   */
  @Authenticated()
  @Authorized('internal:schema:delete', { derriveAlternativeScopes: false })
  @Mutation(_returns => Boolean)
  async removeSingleton(
    @Arg('id')
    id: string,
  ): Promise<boolean> {
    const schemaRepository = getRepository(Schema);
    const documentRepository = getRepository(Document);

    try {
      const [schema, documents] = await Promise.all([
        schemaRepository.findOneOrFail({ where: { id, type: SchemaType.SINGLETON } }),
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

  private makeInitialSingletonData(fields: Field[]): Record<string, any> {
    return fields.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.name]:
          curr.settings.default !== undefined
            ? curr.settings.default
            : curr.dockiteField?.defaultValue(),
      };
    }, {});
  }
}
