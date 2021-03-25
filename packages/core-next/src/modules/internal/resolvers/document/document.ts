/* eslint-disable class-methods-use-this */
import debug from 'debug';
import { cloneDeep, merge } from 'lodash';
import { Arg, Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, IsNull, Not, Repository } from 'typeorm';

import { Document, DocumentRevision, Schema } from '@dockite/database';
import { FindManyResult, GlobalContext, SchemaType } from '@dockite/types';
import { WhereBuilder } from '@dockite/where-builder';

import { Authenticated, Authorized } from '../../../../common/decorators';
import { getInitialDocumentData } from '../../../../common/util';

import {
  AllDocumentsArgs,
  CreateDocumentArgs,
  DeleteDocumentArgs,
  GetDocumentByIdArgs,
  PartialUpdateDocumentsInSchemaArgs,
  RestoreDocumentArgs,
  UpdateDocumentArgs,
} from './args';
import { DocumentsAndRevisionsResult, FindManyDocumentsResult } from './types';
import {
  addSortBy,
  callCrudLifecycleHooks,
  createFindManyResult,
  processDocumentOutput,
} from './util';

const log = debug('dockite:core:resolvers:document');

/**
 * The class containing all the GraphQL queries and mutations for the Document entity.
 */
@Resolver(_of => Document)
export class DocumentResolver {
  private documentRepository: Repository<Document>;

  private documentRevisionRepository: Repository<DocumentRevision>;

  private schemaRepository: Repository<Schema>;

  constructor() {
    this.documentRepository = getRepository(Document);

    this.documentRevisionRepository = getRepository(DocumentRevision);

    this.schemaRepository = getRepository(Schema);
  }

  /**
   * CRUD RESOLVERS
   */

  @Authenticated()
  @Authorized({
    scope: 'internal:document:read',
    resourceType: 'schema',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Query(_returns => Document)
  public async getDocument(
    @Args()
    input: GetDocumentByIdArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Document> {
    const { id, deleted, locale, fallbackLocale } = input;

    try {
      const qb = this.documentRepository
        .createQueryBuilder('document')
        .where('document.id = :id', { id })
        .andWhere('document.locale = :locale', { locale })
        .leftJoinAndSelect('document.user', 'user')
        .leftJoinAndSelect('document.schema', 'schema')
        .leftJoinAndSelect('schema.fields', 'fields');

      if (fallbackLocale) {
        qb.orWhere('document.parentId = :id');
      }

      if (deleted) {
        qb.andWhere('document.deletedAt IS NOT NULL').withDeleted();
      }

      const document = await qb.getOneOrFail();

      await processDocumentOutput(document, document.schema, ctx.user);

      return document;
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve document with ID ${input.id}`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:read',
    resourceType: 'schema',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Query(_returns => FindManyDocumentsResult)
  @Query(_returns => FindManyDocumentsResult, { name: 'findDocuments' })
  public async allDocuments(
    @Args({ validate: true })
    input: AllDocumentsArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<FindManyResult<Document>> {
    const { sort, where, deleted, locale, perPage, schemaId } = input;

    const page = input.page - 1;

    try {
      const qb = this.documentRepository
        .createQueryBuilder('document')
        .andWhere('document.locale = :locale', { locale })
        .andWhere('schema.type = :schemaType', { schemaType: SchemaType.DEFAULT })
        .leftJoinAndSelect('document.user', 'user')
        .leftJoinAndSelect('document.schema', 'schema')
        .leftJoinAndSelect('schema.fields', 'fields')
        .take(perPage)
        .skip(page * perPage);

      if (schemaId) {
        qb.andWhere('document.schemaId = :schemaId', { schemaId });
      }

      if (where) {
        WhereBuilder.Build(qb, where);
      }

      if (sort) {
        addSortBy(qb, sort);
      } else {
        qb.orderBy('document.updatedAt', 'DESC');
      }

      if (deleted) {
        qb.andWhere('document.deletedAt IS NOT NULL').withDeleted();
      }

      const [documents, count] = await qb.getManyAndCount();

      await Promise.all(
        documents.map(document => processDocumentOutput(document, document.schema, ctx.user)),
      );

      return createFindManyResult<Document>(documents, count, input.page, perPage);
    } catch (err) {
      log(err);

      throw new Error(`Unable to retrieve documents`);
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:create',
    resourceType: 'schema',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['input.schemaId'],
  })
  @Mutation(_returns => Document)
  public async createDocument(
    @Arg('input', _type => CreateDocumentArgs)
    input: CreateDocumentArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Document> {
    const { schemaId, locale, parentId } = input;

    try {
      const schema = await this.schemaRepository.findOneOrFail({
        where: {
          id: schemaId,
        },
        relations: ['fields'],
      });

      let data = merge(getInitialDocumentData(schema), input.data);

      // If we have an associated parent we only want to deal with the fields that were provided data
      // rather than assigning defaults which would fork the document further from its parent
      if (parentId) {
        // Attempt to fetch the parent to ensure that they exist, this will also serve as an early abort
        // in the event that no matching parent can be found
        await this.documentRepository.findOneOrFail(parentId);

        data = input.data;
      }

      await callCrudLifecycleHooks('create', schema, data);

      const savedDocument = await this.documentRepository.save({
        data,
        locale,
        schemaId,
        parentId,
        userId: ctx.user?.id,
      });

      const document = await this.documentRepository.findOneOrFail({
        where: {
          id: savedDocument.id,
        },
        relations: ['schema', 'schema.fields', 'user'],
      });

      return document;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to create the document');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:update',
    resourceType: 'schema',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['input.schemaId'],
  })
  @Mutation(_returns => Document)
  public async updateDocument(
    @Arg('input', _type => UpdateDocumentArgs)
    input: UpdateDocumentArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Document> {
    const { id, locale, releaseId } = input;

    try {
      const document = await this.documentRepository.findOneOrFail({
        where: {
          id,
        },
        relations: ['schema', 'schema.fields', 'user'],
      });

      const { schema } = document;

      const oldData = cloneDeep(document.data);
      const revisionData = cloneDeep(document.data);

      const data = merge(cloneDeep(document.data), input.data);

      await callCrudLifecycleHooks('update', schema, data, document, oldData);

      // TODO: Add some handling around the potential switching of locales
      // TODO: to ensure that the application doesn't get into a bad state
      const [updatedDocument] = await Promise.all([
        this.documentRepository.save({
          ...document,
          data,
          userId: ctx.user?.id,
          locale: locale ?? document.locale,
          releaseId: releaseId ?? document.releaseId,
        }),
        this.documentRevisionRepository.save({
          data: cloneDeep(revisionData),
          documentId: document.id,
          schemaId: document.schemaId,
          userId: ctx.user?.id,
          createdAt: new Date(),
          updatedAt: document.updatedAt,
        }),
      ]);

      return merge(cloneDeep(document), updatedDocument);
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to update the document');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:delete',
    deriveFurtherAlternativeScopes: true,
    resourceType: 'schema',
    entity: Document,
    entityIdentifierArgument: 'input.id',
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Mutation(_returns => Boolean)
  public async deleteDocument(
    @Arg('input', _type => DeleteDocumentArgs)
    input: DeleteDocumentArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const document = await this.documentRepository.findOneOrFail({
        where: {
          id,
        },
        relations: ['schema', 'schema.fields', 'user'],
      });

      const { schema } = document;

      const oldData = cloneDeep(document.data);
      const revisionData = cloneDeep(document.data);

      await callCrudLifecycleHooks('softDelete', schema, document.data, document, oldData);

      // TODO: Add some handling around the potential handling surround the
      // TODO: deleting of a root locale document
      await Promise.all([
        // !: Listeners may need to be disabled here, if so write up the reasoning as to why
        this.documentRepository.softRemove(document),
        this.documentRevisionRepository.save({
          data: cloneDeep(revisionData),
          documentId: document.id,
          schemaId: document.schemaId,
          userId: ctx.user?.id,
          createdAt: new Date(),
          updatedAt: document.updatedAt,
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
    scope: 'internal:document:delete',
    deriveFurtherAlternativeScopes: true,
    resourceType: 'schema',
    entity: Document,
    entityIdentifierArgument: 'input.id',
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Mutation(_returns => Boolean)
  public async permanentlyDeleteDocument(
    @Arg('input', _type => DeleteDocumentArgs)
    input: DeleteDocumentArgs,
    @Ctx()
    _ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const document = await this.documentRepository.findOneOrFail({
        where: {
          id,
        },
        relations: ['schema', 'schema.fields', 'user'],
      });

      const { schema } = document;

      const oldData = cloneDeep(document.data);

      await callCrudLifecycleHooks('permanentDelete', schema, document.data, document, oldData);

      // TODO: Add some handling around the potential handling surround the
      // TODO: deleting of a root locale document
      await Promise.all([
        // !: Listeners may need to be disabled here, if so write up the reasoning as to why
        this.documentRepository.remove(document),
      ]);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:update',
    deriveFurtherAlternativeScopes: true,
    resourceType: 'schema',
    entity: Document,
    entityIdentifierArgument: 'input.id',
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Mutation(_returns => Boolean)
  public async restoreDocument(
    @Arg('input', _type => RestoreDocumentArgs)
    input: RestoreDocumentArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    const { id } = input;

    try {
      const document = await this.documentRepository.findOneOrFail({
        where: {
          id,
          deletedAt: Not(IsNull()),
        },
        relations: ['schema', 'schema.fields', 'user'],
        withDeleted: true,
      });

      const { schema } = document;

      const oldData = cloneDeep(document.data);
      const revisionData = cloneDeep(document.data);

      await callCrudLifecycleHooks('update', schema, document.data, document, oldData);

      // TODO: Add some handling around the potential handling surround the
      // TODO: restoring of a root locale document
      await Promise.all([
        // !: Listeners may need to be disabled here, if so write up the reasoning as to why
        this.documentRepository.restore(document),
        this.documentRevisionRepository.save({
          data: cloneDeep(revisionData),
          documentId: document.id,
          schemaId: document.schemaId,
          userId: ctx.user?.id,
          createdAt: new Date(),
          updatedAt: document.updatedAt,
        }),
      ]);

      return true;
    } catch (err) {
      log(err);

      return false;
    }
  }

  /**
   * EXTRA RESOLVERS
   */

  @Authenticated()
  @Authorized({
    scope: 'internal:document:update',
    resourceType: 'schema',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['schemaId'],
  })
  @Mutation(_returns => Document)
  public async updateManyDocument(
    @Arg('input', _type => [UpdateDocumentArgs])
    input: UpdateDocumentArgs[],
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Document[]> {
    try {
      // First we process each provided document, calling its lifecycle hooks and creating
      // the provided payloads for the updating of the document and creation of the revision
      const documentsAndRevisions: DocumentsAndRevisionsResult[] = await Promise.all(
        input.map(async i => {
          const { id, locale, releaseId } = i;

          const document = await this.documentRepository.findOneOrFail({
            where: {
              id,
            },
            relations: ['schema', 'schema.fields', 'user'],
          });

          const { schema } = document;

          const oldData = cloneDeep(document.data);
          const revisionData = cloneDeep(document.data);

          const data = merge(cloneDeep(document.data), i.data);

          await callCrudLifecycleHooks('update', schema, data, document, oldData);

          // TODO: Add some handling around the potential switching of locales
          // TODO: to ensure that the application doesn't get into a bad state
          return {
            document: this.documentRepository.create({
              ...document,
              data,
              userId: ctx.user?.id,
              locale: locale ?? document.locale,
              releaseId: releaseId ?? document.releaseId,
            }),
            revision: this.documentRevisionRepository.create({
              data: cloneDeep(revisionData),
              documentId: document.id,
              schemaId: document.schemaId,
              userId: ctx.user?.id,
              createdAt: new Date(),
              updatedAt: document.updatedAt,
            }),
          };
        }),
      );

      // Provided no document encountered an error during the processing step we can then
      // save each document and return the merged result
      const documents = await Promise.all(
        documentsAndRevisions.map(async ({ document, revision }) => {
          const [updatedDocument] = await Promise.all([
            this.documentRepository.save(document),
            this.documentRevisionRepository.save(revision),
          ]);

          return merge(cloneDeep(document), updatedDocument);
        }),
      );

      return documents;
    } catch (err) {
      log(err);

      throw new Error('An error occurred while attempting to update the provided documents');
    }
  }

  @Authenticated()
  @Authorized({
    scope: 'internal:document:update',
    resourceType: 'schema',
    deriveFurtherAlternativeScopes: true,
    checkArgsOrFields: true,
    fieldsOrArgsToLookup: ['input.schemaId'],
  })
  public async partialUpdateDocumentsInSchema(
    @Arg('input', _type => PartialUpdateDocumentsInSchemaArgs)
    input: PartialUpdateDocumentsInSchemaArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<Document[]> {
    // TODO: Consider revising to better handle updating schemas with large amounts of documents,
    // TODO: this may involve threading or similar?

    try {
      const { schemaId, documentIds, data } = input;

      const schema = await this.schemaRepository.findOneOrFail({
        where: { id: schemaId },
        relations: ['fields'],
      });

      // Call the lifecycle hook on the partial data
      await callCrudLifecycleHooks('update', schema, data);

      const qb = this.documentRepository
        .createQueryBuilder('document')
        .where('1 = 1')
        .leftJoinAndSelect('document.schema', 'schema')
        .leftJoinAndSelect('document.user', 'user');

      if (documentIds.length > 0) {
        qb.andWhere('document.id in (:...documentIds)', { documentIds });
      }

      const documents = await qb.getMany();

      const revisions = documents.map(document =>
        this.documentRevisionRepository.create({
          documentId: document.id,
          data: cloneDeep(document.data),
          schemaId,
          updatedAt: document.updatedAt,
          createdAt: new Date(),
          userId: ctx.user?.id,
        }),
      );

      // Fire the promise without awaiting so it may continue working while we merge documents
      const revisionsPromise = this.documentRevisionRepository.save(revisions, { chunk: 100 });

      const mergedDocuments = documents.map(document => {
        const mergedData = merge(cloneDeep(document.data), data);

        return this.documentRepository.create({
          ...document,
          data: mergedData,
          userId: ctx.user?.id,
        });
      });

      const [updatedDocuments] = await Promise.all([
        await this.documentRepository.save(mergedDocuments, { chunk: 100 }),
        revisionsPromise,
      ]);

      return updatedDocuments;
    } catch (err) {
      log(err);

      throw new Error(
        'An error occurred while attempting to partial update the provided documents',
      );
    }
  }
}

export default DocumentResolver;
