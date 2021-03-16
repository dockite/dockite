/* eslint-disable class-methods-use-this */
import debug from 'debug';
import { cloneDeep, merge } from 'lodash';
import { Arg, Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Document, DocumentRevision, Schema } from '@dockite/database';
import { FindManyResult, GlobalContext, SchemaType } from '@dockite/types';
import { WhereBuilder } from '@dockite/where-builder';

import getInitialDocumentData from '../../../../common/util/getInitialDocumentData';

import {
  AllDocumentsArgs,
  CreateDocumentArgs,
  GetDocumentByIdArgs,
  UpdateDocumentArgs,
} from './args';
import { FindManyDocumentsResult } from './types';
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
        .leftJoinAndSelect('user', 'user')
        .leftJoinAndSelect('schema', 'schema')
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

  @Query(_returns => FindManyDocumentsResult)
  @Query(_returns => FindManyDocumentsResult, { name: 'findDocuments' })
  public async allDocuments(
    @Args({ validate: true })
    input: AllDocumentsArgs,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<FindManyResult<Document>> {
    const { sort, where, deleted, locale, perPage } = input;

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
}

export default DocumentResolver;
