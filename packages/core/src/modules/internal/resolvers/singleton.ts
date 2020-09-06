import {
  Document,
  Schema,
  SchemaImportRepository,
  SchemaRevision,
  Singleton,
  SchemaType,
  Field,
} from '@dockite/database';
import { GlobalContext } from '@dockite/types';
import { AuthenticationError, ValidationError } from 'apollo-server-express';
import { GraphQLError } from 'graphql';
import { omit } from 'lodash';
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
import { getCustomRepository, getRepository } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

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
    @Arg('id', _type => String, { nullable: true }) id: string | null,
    @Arg('name', _type => String, { nullable: true }) name: string | null,
  ): Promise<Singleton | null> {
    const schemaRepository = getRepository(Schema);
    const documentRepository = getRepository(Document);

    let schema;

    if (id) {
      schema = await schemaRepository.findOne({
        where: { id, deletedAt: null, type: SchemaType.SINGLETON },
        relations: ['fields'],
      });
    } else if (name) {
      schema = await schemaRepository.findOne({
        relations: ['fields'],
        where: { name, deletedAt: null, type: SchemaType.SINGLETON },
      });
    }

    if (!schema) {
      return null;
    }

    const document = await documentRepository.findOneOrFail({ where: { schemaId: schema.id } });

    schema.groups = schema.groups.reduce(
      (acc: Record<string, string[]>, curr: Record<string, string[]>) => ({ ...acc, ...curr }),
      {},
    );

    return { ...schema, data: document.data };
  }

  @Authenticated()
  @Authorized('internal:schema:read')
  @Query(_returns => ManySingletons)
  async allSingletons(): Promise<ManySingletons> {
    const repository = getRepository(Schema);

    const [results, totalItems] = await repository.findAndCount({
      where: { deletedAt: null, type: SchemaType.SINGLETON },
      relations: ['fields', 'documents'],
    });

    results.forEach(schema => {
      // eslint-disable-next-line no-param-reassign
      schema.groups = schema.groups.reduce(
        (acc: Record<string, string[]>, curr: Record<string, string[]>) => ({ ...acc, ...curr }),
        {},
      );
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
  @Authorized('internal:schema:update', { derriveAlternativeScopes: false })
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

    if (data) {
      document.data = data;
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
    payload: string,
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

    const parsedPayload: Schema = JSON.parse(payload);

    parsedPayload.type = SchemaType.SINGLETON;

    const valid = schemaImportValidator(parsedPayload);

    if (!valid) {
      console.log(schemaImportValidator.errors);
      throw new ValidationError('Payload provided is invalid');
    }

    if (!ctx.user) {
      throw new AuthenticationError('Not authenticated');
    }

    const importedSingleton = await schemaImportRepository.importSchema(
      schemaId,
      parsedPayload,
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
