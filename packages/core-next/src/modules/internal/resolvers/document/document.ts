/* eslint-disable class-methods-use-this */
import debug from 'debug';
import { Arg, Args, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository, Repository } from 'typeorm';

import { Document } from '@dockite/database';
import { FindManyResult, GlobalContext, SchemaType } from '@dockite/types';
import { WhereBuilder } from '@dockite/where-builder';

import { AllDocumentsArgs, GetDocumentByIdArgs } from './args';
import { FindManyDocumentsResult } from './types';
import { addSortBy, createFindManyResult, processDocumentOutput } from './util';

const log = debug('dockite:core:resolvers:document');

/**
 * The class containing all the GraphQL queries and mutations for the Document entity.
 */
@Resolver(_of => Document)
export class DocumentResolver {
  private documentRepository: Repository<Document>;

  constructor() {
    this.documentRepository = getRepository(Document);
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

      console.log(qb.getQueryAndParameters());

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
  public async updateDocument(
    @Arg('input', _type => UpdateDocumentInputType)
    input: UpdateDocumentInputType,
  ): Promise<Document> {}
}

export default DocumentResolver;
