/* eslint-disable class-methods-use-this */
import debug from 'debug';
import GraphQLJSON from 'graphql-type-json';
import { cloneDeep, merge, omit } from 'lodash';
import { Arg, Args, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import {
  Document,
  DocumentRevision,
  Field,
  Schema,
  SchemaRevision,
  SchemaType,
  Singleton,
} from '@dockite/database';
import { GlobalContext } from '@dockite/types';

import { MAX_32_BIT_INT } from '../../../../common/constants';
import { Authenticated, Authorized } from '../../../../common/decorators';
import { getInitialDocumentData, getRootLocale } from '../../../../common/util';
import { createFindManyResult } from '../document/util';

import {
  AllSingletonsArgs,
  CreateSingletonArgs,
  DeleteSingletonArgs,
  GetSingletonByIdArgs,
  ImportSingletonArgs,
  RestoreSingletonArgs,
  UpdateSingletonArgs,
} from './args';
import { FindManySingletonsResult } from './types';
import {
  createSingletonFromSchemaAndDocuments,
  getCreatedSingletonFieldsFromPayload,
  getDeletedSingletonFieldsFromPayload,
  getRenamedSingletonFieldsFromPayload,
  mapPayloadFieldsToSingletonFields,
  reviseAllDocumentsForSingleton,
  updateDocumentsWithFieldChanges,
} from './util';

const log = debug('dockite:core:resolvers:singleton');

/**
 *
 */
@Resolver(_of => Singleton)
export class SingletonResolver {
  private singletonRepository: Repository<Schema>;

  private documentRepository: Repository<Document>;

  private documentRevisionRepository: Repository<DocumentRevision>;

  private schemaRevisionRepository: Repository<SchemaRevision>;

  private fieldRepository: Repository<Field>;

  constructor() {
    this.singletonRepository = getRepository(Schema);

    this.documentRepository = getRepository(Document);

    this.documentRevisionRepository = getRepository(DocumentRevision);

    this.schemaRevisionRepository = getRepository(SchemaRevision);

    this.fieldRepository = getRepository(Field);
  }

  /**
   * CRUD RESOLVERS
   */

  @Authenticated()
  @Authorized({
    scope: 'internal:singleton:read',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['id', 'singletonId'],
  })
  @Query(_returns => Singleton)
  public async getSingleton(
    @Args()
    input: GetSingletonByIdArgs,
  ): Promise<Singleton> {
    const { id, deleted, locale } = input;

    try {
      const qb = this.singletonRepository
        .createQueryBuilder('singleton')
        .where('singleton.id = :id', { id })
        .leftJoinAndSelect('singleton.fields', 'fields')
        .leftJoinAndSelect('singleton.user', 'user')
        .leftJoinAndSelect('singleton.documents', 'document')
        .andWhere('singleton.type = :type', { type: SchemaType.SINGLETON })
        .andWhere('document.locale = :locale', { locale });

      if (deleted) {
        qb.andWhere('singleton.deletedAt IS NOT NULL').withDeleted();
      }

      const singleton = await qb.getOneOrFail();

      return createSingletonFromSchemaAndDocuments(singleton);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve singleton with ID ${id}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:singleton:read',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['id', 'singletonId'],
  })
  @Query(_returns => FindManySingletonsResult, { name: 'findSingletons' })
  @Query(_returns => FindManySingletonsResult)
  public async allSingletons(
    @Args()
    input: AllSingletonsArgs,
  ): Promise<FindManySingletonsResult> {
    const { deleted } = input;

    const qb = this.singletonRepository
      .createQueryBuilder('singleton')
      .andWhere('singleton.type = :type', { type: SchemaType.SINGLETON })
      .leftJoinAndSelect('singleton.fields', 'fields')
      .leftJoinAndSelect('singleton.user', 'user')
      .leftJoinAndSelect('singleton.documents', 'documents');

    if (deleted) {
      qb.andWhere('singleton.deletedAt IS NOT NULL').withDeleted();
    }

    const [singletons, count] = await qb.getManyAndCount();

    const mappedSingletons = singletons.map(s => createSingletonFromSchemaAndDocuments(s));

    return createFindManyResult<Singleton>(mappedSingletons, count, 1, MAX_32_BIT_INT);
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:singleton:create',
  })
  @Mutation(_returns => Singleton)
  public async createSingleton(
    @Arg('input', _type => CreateSingletonArgs, { validate: true })
    input: CreateSingletonArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton> {
    const { name, title, groups, settings, data } = input;

    try {
      const matched = await this.singletonRepository.find({
        where: { name },
        withDeleted: true,
      });

      if (matched && matched.length > 0) {
        throw new Error('Singleton name provided is not unique');
      }

      const singleton = await this.singletonRepository.save({
        name,
        title,
        type: SchemaType.SINGLETON,
        groups,
        settings,
        userId: ctx.user?.id,
      });

      const document = await this.documentRepository.create({
        data: merge(getInitialDocumentData(singleton), data),

        locale: getRootLocale(),
        schemaId: singleton.id,
        userId: ctx.user?.id,

        // Forcefully set creation and updated times to match the singleton
        createdAt: singleton.createdAt,
        updatedAt: singleton.updatedAt,
      });

      return { ...singleton, data: document.data };
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to create the singleton');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:singleton:update',
  })
  @Mutation(_returns => Singleton)
  public async updateSingleton(
    @Arg('input', _type => UpdateSingletonArgs, { validate: true })
    input: UpdateSingletonArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton> {
    const { id, name, title, groups, settings, data, locale } = input;

    try {
      const singleton = await this.singletonRepository
        .createQueryBuilder('singleton')
        .where('singleton.id = :id', { id })
        .andWhere('documents.locale = :locale', { locale })
        .leftJoinAndSelect('singleton.fields', 'fields')
        .leftJoinAndSelect('singleton.user', 'user')
        .leftJoinAndSelect('singleton.documents', 'documents')
        .getOneOrFail();

      const [document] = singleton.documents;

      // Clone the retrieved singleton but omit the `dockiteField` property from the retrieved fields
      // to avoid circular dependencies during serialization
      const clonedSingleton = cloneDeep({
        ...singleton,
        fields: singleton.fields.map(field => omit(field, 'dockiteField')),
      });

      const [updatedSingleton] = await Promise.all([
        this.singletonRepository.save({
          ...singleton,
          name: name || singleton.name,
          title: title || singleton.title,
          groups,
          settings,
        }),
        this.schemaRevisionRepository.save({
          singletonId: singleton.id,
          data: clonedSingleton,
          updatedAt: singleton.updatedAt,
          userId: ctx.user?.id,
        }),
        this.documentRepository.save({
          ...document,
          data: merge(getInitialDocumentData(singleton), document.data, data),
        }),
      ]);

      const s = merge(cloneDeep(updatedSingleton), singleton);

      return { ...s, data: document.data };
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to update the singleton');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:singleton:delete',
  })
  @Mutation(_returns => Boolean)
  public async deleteSingleton(
    @Arg('input', _type => DeleteSingletonArgs)
    input: DeleteSingletonArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const singleton = await this.singletonRepository.findOneOrFail({
        where: { id },
        relations: ['fields', 'user'],
      });

      // Clone the retrieved singleton but omit the `dockiteField` property from the retrieved fields
      // to avoid circular dependencies during serialization
      const clonedSingleton = cloneDeep({
        ...singleton,
        fields: singleton.fields.map(field => omit(field, 'dockiteField')),
      });

      await Promise.all([
        this.singletonRepository.softRemove(singleton),
        this.schemaRevisionRepository.save({
          singletonId: singleton.id,
          data: clonedSingleton,
          updatedAt: singleton.updatedAt,
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
    scope: 'internal:singleton:delete',
  })
  @Mutation(_returns => Boolean)
  public async permanentlyDeleteSingleton(
    @Arg('input', _type => DeleteSingletonArgs)
    input: DeleteSingletonArgs,
    @Ctx()
    _ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const [singleton, revisions] = await Promise.all([
        this.singletonRepository.findOneOrFail({
          where: { id },
          relations: ['fields', 'user'],
        }),
        this.schemaRevisionRepository.find({ where: { singletonId: id } }),
      ]);

      await Promise.all([
        this.singletonRepository.remove(singleton),
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
    scope: 'internal:singleton:update',
  })
  @Mutation(_returns => Singleton)
  public async restoreSingleton(
    @Arg('input', _type => RestoreSingletonArgs)
    input: RestoreSingletonArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton> {
    const { id } = input;

    try {
      const singleton = await this.singletonRepository.findOneOrFail({
        where: { id },
        relations: ['fields', 'user'],
        withDeleted: true,
      });

      // Clone the retrieved singleton but omit the `dockiteField` property from the retrieved fields
      // to avoid circular dependencies during serialization
      const clonedSingleton = cloneDeep({
        ...singleton,
        fields: singleton.fields.map(field => omit(field, 'dockiteField')),
      });

      await Promise.all([
        this.singletonRepository.recover(singleton),
        this.schemaRevisionRepository.save({
          singletonId: singleton.id,
          data: clonedSingleton,
          updatedAt: singleton.updatedAt,
          userId: ctx.user?.id,
        }),
      ]);

      const restoredSingleton = await this.singletonRepository.findOneOrFail(singleton.id, {
        relations: ['fields', 'user', 'documents'],
      });

      return createSingletonFromSchemaAndDocuments(restoredSingleton);
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to restore the singleton');
    }
  }

  /**
   * EXTRA RESOLVERS
   */
  @Authenticated()
  @Authorized({
    scope: 'internal:singleton:update',
  })
  @Mutation(_returns => Singleton)
  public async importSingleton(
    @Arg('input', _type => ImportSingletonArgs)
    input: ImportSingletonArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Singleton> {
    // TODO: Add the Ajv validation from the @dockite/database package
    const { id, payload } = input;

    try {
      if (typeof payload !== 'object') {
        throw new Error('Provided payload was not an object');
      }

      let singleton = new Schema();

      // If a singleton id has been provided, fetch the singleton failing if there are no matches
      if (id || payload.id) {
        singleton = await this.singletonRepository.findOneOrFail({
          where: {
            id: id ?? payload.id,
          },
          relations: ['fields', 'user', 'documents'],
        });

        const clonedSingleton = cloneDeep({
          ...singleton,
          fields: singleton.fields.map(field => omit(field, 'dockiteField')),
        });

        await this.schemaRevisionRepository.save({
          singletonId: singleton.id,
          data: clonedSingleton,
          updatedAt: singleton.updatedAt,
          userId: ctx.user?.id,
        });
      }

      // Retrieve the singletons fields defaulting to an empty array
      const singletonFields = cloneDeep(singleton.fields ?? []);

      // Map the provided fields from the payload to a relevant singleton field if possible
      const fieldsToImport = mapPayloadFieldsToSingletonFields(singletonFields, payload.fields);

      // If we were able to retrieve a singleton, perform calculations on which fields have been modified
      // and update the corresponding documents
      if (singleton.id) {
        const fieldsThatHaveBeenRenamed = getRenamedSingletonFieldsFromPayload(
          singletonFields,
          fieldsToImport,
        );

        const fieldsThatHaveBeenDeleted = getDeletedSingletonFieldsFromPayload(
          singletonFields,
          fieldsToImport,
        );

        const fieldsThatHaveBeenCreated = getCreatedSingletonFieldsFromPayload(
          singletonFields,
          fieldsToImport,
        );

        const fieldDeletionPromise = this.fieldRepository.remove(fieldsThatHaveBeenDeleted);

        await reviseAllDocumentsForSingleton(singleton, ctx.user?.id || null);

        await updateDocumentsWithFieldChanges(
          singleton,
          fieldsThatHaveBeenRenamed,
          fieldsThatHaveBeenDeleted,
          fieldsThatHaveBeenCreated,
        );

        await fieldDeletionPromise;
      }

      // Assign the payload values to the singleton
      Object.assign(singleton, omit(payload, 'fields', 'data'));

      // Set the singletons fields the mapped fields
      singleton.fields = fieldsToImport.map(f => this.fieldRepository.create(f));

      // Save the singleton
      const savedSingleton = await this.singletonRepository.save(singleton);

      return createSingletonFromSchemaAndDocuments(merge(cloneDeep(savedSingleton), singleton));
    } catch (err) {
      log(err);

      throw new Error('An error occurred while importing your singleton');
    }
  }

  /**
   * Outputs groups in a PWA friendly manner
   */
  @FieldResolver(_type => GraphQLJSON)
  protected groups(
    @Root()
    singleton: Singleton,
  ): Record<string, string[]> {
    const groups = {};

    const singletonGroups = singleton.groups as Array<Record<string, string[]>>;

    singletonGroups.forEach(singletonGroup => {
      Object.assign(groups, singletonGroup);
    });

    return groups;
  }
}

export default SingletonResolver;
