/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Document, DocumentRevision, Schema, SearchEngineRepository } from '@dockite/database';
import { HookContext, HookContextWithOldData } from '@dockite/types';
import { QueryBuilder, WhereBuilder, WhereBuilderInputType } from '@dockite/where-builder';
import GraphQLJSON from 'graphql-type-json';
import { cloneDeep } from 'lodash';
import {
  Arg,
  Ctx,
  Field as GraphQLField,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { getCustomRepository, getManager, getRepository } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { GlobalContext } from '../../../common/types';
import { afterRemove, afterUpdate } from '../../../subscribers';
import { strToColumnPath } from '../../../utils';

import { SortInputType } from './inputs/sort';

@ObjectType()
class ManyDocuments {
  @GraphQLField(_type => [Document])
  results!: Document[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@InputType()
class UpdateManyDocumentInputItem {
  @GraphQLField(_type => String)
  id!: string;

  @GraphQLField(_type => GraphQLJSON)
  data!: Record<string, any>;
}

@Resolver(_of => Document)
export class DocumentResolver {
  @Authenticated()
  @Authorized('internal:document:read', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Query(_returns => Document, { nullable: true })
  async getDocument(
    @Arg('id')
    id: string,
  ): Promise<Document | null> {
    const repository = getRepository(Document);

    const document = await repository.findOne({
      where: { id },
      relations: ['schema', 'schema.fields', 'user'],
      withDeleted: true,
    });

    if (!document) {
      return null;
    }

    await Promise.all(
      document.schema.fields.map(async field => {
        document.data[field.name] = await field.dockiteField!.processOutputRaw({
          data: { id: document.id, ...document.data },
          field,
          fieldData: document.data[field.name] ?? null,
          document,
        });
      }),
    );

    return document;
  }

  @Authenticated()
  @Authorized('internal:document:read', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Query(_type => ManyDocuments)
  async findDocuments(
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
    @Arg('schemaIds', _type => [String], { nullable: true })
    schemaIds: string | null,
    @Arg('where', _type => WhereBuilderInputType, { nullable: true })
    where: QueryBuilder | null,
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
    @Arg('sort', _type => SortInputType, { nullable: true })
    sort: SortInputType | null,
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean | null,
  ): Promise<ManyDocuments> {
    const repository = getRepository(Document);

    const qb = repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .leftJoinAndSelect('schema.fields', 'fields');

    if (schemaId) {
      qb.andWhere('document.schemaId = :schemaId', { schemaId });
    }

    if (schemaIds) {
      qb.andWhere('document.schemaId IN (:...schemaIds)', { schemaIds });
    }

    if (where) {
      WhereBuilder.Build(qb, where);
    }

    if (sort) {
      const columnPath = strToColumnPath(sort.name);

      // This handle the case where typeorm can't add abritary orderBy's to a query
      // by adding the column to order by to the select column we can avoid breaking typeorm
      // and successfully get our results.
      if (sort.name.startsWith('data')) {
        qb.addSelect(`document.${strToColumnPath(sort.name)}`, 'sorter');
        qb.orderBy('sorter', sort.direction);
      } else {
        qb.orderBy(`document.${columnPath}`, sort.direction);
      }
    } else {
      qb.orderBy('document.updatedAt', 'DESC');
    }

    if (deleted) {
      qb.andWhere('document.deletedAt IS NOT NULL').withDeleted();
    } else {
      qb.andWhere('document.deletedAt IS NULL');
    }

    qb.take(perPage).skip(perPage * (page - 1));

    const [results, totalItems] = await qb.getManyAndCount();

    await Promise.all(
      results.map(async item => {
        await Promise.all(
          item.schema.fields.map(async field => {
            item.data[field.name] = await field.dockiteField!.processOutputRaw({
              data: { id: item.id, ...item.data },
              field,
              fieldData: item.data[field.name] ?? null,
              document: item,
            });
          }),
        );
      }),
    );

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results,
      totalItems,
      currentPage: page,
      hasNextPage: page < totalPages,
      totalPages,
    };
  }

  // TODO: Update to query builder
  @Authenticated()
  @Authorized('internal:document:read', { derriveAlternativeScopes: false })
  @Query(_returns => ManyDocuments)
  async allDocuments(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
    @Arg('where', _type => WhereBuilderInputType, { nullable: true })
    where: QueryBuilder | null,
    @Arg('sort', _type => SortInputType, { nullable: true })
    sort: SortInputType | null,
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean | null,
  ): Promise<ManyDocuments> {
    const repository = getRepository(Document);

    const qb = repository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .leftJoinAndSelect('schema.fields', 'fields')
      .take(perPage)
      .skip(perPage * (page - 1));

    if (sort) {
      qb.orderBy(`document.${strToColumnPath(sort.name)}`, sort.direction);
    } else {
      qb.orderBy('document.updatedAt', 'DESC');
    }

    if (where) {
      WhereBuilder.Build(qb, where);
    }

    if (deleted) {
      qb.andWhere('document.deletedAt IS NOT NULL').withDeleted();
    } else {
      qb.andWhere('document.deletedAt IS NULL');
    }

    const [results, totalItems] = await qb.getManyAndCount();

    await Promise.all(
      results.map(async item => {
        await Promise.all(
          item.schema.fields.map(async field => {
            item.data[field.name] = await field.dockiteField!.processOutputRaw({
              data: { id: item.id, ...item.data },
              field,
              fieldData: item.data[field.name] ?? null,
            });
          }),
        );
      }),
    );

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results,
      currentPage: page,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  @Authenticated()
  @Authorized('internal:document:read', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Query(_returns => ManyDocuments)
  async searchDocuments(
    @Arg('term', _type => String)
    term: string,
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
    @Arg('schemaIds', _type => [String], { nullable: true })
    schemaIds: string[] | null,
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
    @Arg('where', _type => WhereBuilderInputType, { nullable: true })
    where: QueryBuilder | null,
    @Arg('sort', _type => SortInputType, { nullable: true })
    sort: SortInputType | null,
    @Arg('deleted', _type => Boolean, { nullable: true })
    deleted: boolean | null,
  ): Promise<ManyDocuments> {
    const repository = getCustomRepository(SearchEngineRepository);

    const qb = repository
      .search(term)
      .leftJoinAndSelect('document.schema', 'schema')
      .leftJoinAndSelect('schema.fields', 'fields')
      .take(perPage)
      .skip(perPage * (page - 1));

    if (sort) {
      qb.orderBy(`document.${strToColumnPath(sort.name)}`, sort.direction);
    } else {
      qb.orderBy('document.updatedAt', 'DESC');
    }

    if (schemaId && schemaId !== '') {
      qb.andWhere('document.schemaId = :schemaId', { schemaId });
    }

    if (schemaIds && schemaIds.length > 0) {
      qb.andWhere('document.schemaId IN (:...schemaIds)', { schemaIds });
    }

    if (where) {
      WhereBuilder.Build(qb, where);
    }

    if (deleted) {
      qb.andWhere('document.deletedAt IS NOT NULL').withDeleted();
    } else {
      qb.andWhere('document.deletedAt IS NULL');
    }

    const [results, totalItems] = await qb.getManyAndCount();

    await Promise.all(
      results.map(async item => {
        await Promise.all(
          item.schema.fields.map(async field => {
            item.data[field.name] = await field.dockiteField!.processOutputRaw({
              data: { id: item.id, ...item.data },
              field,
              fieldData: item.data[field.name] ?? null,
            });
          }),
        );
      }),
    );

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results: (results as any) as Document[],
      currentPage: page,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  @Authenticated()
  @Authorized('internal:document:create', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Mutation(_returns => Document)
  async createDocument(
    @Arg('locale') locale: string,
    @Arg('data', _type => GraphQLJSON) data: any,
    @Arg('schemaId') schemaId: string,
    @Arg('releaseId', _type => String, { nullable: true }) releaseId: string | null = null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Document | null> {
    const documentRepository = getRepository(Document);
    const schemaRepository = getRepository(Schema);

    const schema = await schemaRepository.findOneOrFail({
      where: { id: schemaId, deletedAt: null },
      relations: ['fields'],
    });

    const { id: userId } = ctx.user!; // eslint-disable-line

    await Promise.all(
      schema.fields.map(async field => {
        const fieldData = data[field.name] ?? null;

        const hookContext: HookContext = { field, fieldData, data };

        data[field.name] = await field.dockiteField!.processInputRaw(hookContext);

        await field.dockiteField!.validateInputRaw(hookContext);

        await field.dockiteField!.onCreate(hookContext);
      }),
    );

    const initialData = this.makeInitialData(schema);

    const document = documentRepository.create({
      locale,
      data: { ...initialData, ...data },
      schemaId,
      schema,
      releaseId,
      userId,
    });

    const savedDocument = await documentRepository.save(document);

    return savedDocument;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Document,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Document, { nullable: true })
  async updateDocument(
    @Arg('id', _type => String)
    id: string | null,
    // @Arg('locale', _type => String, { nullable: true })
    // locale: string | null,
    @Arg('data', _type => GraphQLJSON)
    data: Record<string, any>, // eslint-disable-line
    @Ctx() ctx: GlobalContext,
  ): Promise<Document | null> {
    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const document = await documentRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['schema', 'schema.fields'],
    });

    if (!document) {
      return null;
    }

    const { schema } = document;

    const oldData = cloneDeep(document.data);
    const revision = revisionRepository.create({
      documentId: document.id,
      data: cloneDeep(document.data),
      schemaId: document.schemaId,
      userId: document.userId ?? '',
    });

    await Promise.all(
      schema.fields.map(async field => {
        const fieldData = data[field.name] ?? null;

        const hookContext: HookContextWithOldData = {
          field,
          fieldData,
          data,
          oldData,
          document,
        };

        data[field.name] = await field.dockiteField!.processInputRaw(hookContext);

        await field.dockiteField!.validateInputRaw(hookContext);

        await field.dockiteField!.onUpdate(hookContext);
      }),
    );

    document.data = { ...document.data, ...data };

    document.userId = userId;

    const [savedDocument] = await Promise.all([
      documentRepository.save(document),
      revisionRepository.save(revision),
    ]);

    return savedDocument;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Mutation(_returns => [Document], { nullable: true })
  async updateManyDocuments(
    @Arg('schemaId', _type => String)
    schemaId: string,
    @Arg('documents', _type => [UpdateManyDocumentInputItem])
    documents: UpdateManyDocumentInputItem[],
    @Ctx() ctx: GlobalContext,
  ): Promise<Document[] | null> {
    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const retrievedDocuments = await documentRepository
      .createQueryBuilder('document')
      .select()
      .leftJoinAndSelect('document.schema', 'schema')
      .leftJoinAndSelect('schema.fields', 'fields')
      .whereInIds(documents.map(x => x.id))
      .andWhere('document.schemaId = :schemaId', { schemaId })
      .getMany();

    if (!retrievedDocuments || retrievedDocuments.length === 0) {
      return null;
    }

    const documentsToSave: Document[] = [];
    const revisionsToSave: DocumentRevision[] = [];

    await Promise.all(
      retrievedDocuments.map(async document => {
        const data = documents.find(x => x.id === document.id)?.data;

        if (!data) {
          throw new Error(`updateManyDocuments: unable to map ${document.id} to data`);
        }

        const { schema } = document;

        const oldData = cloneDeep(document.data);

        const revision = revisionRepository.create({
          documentId: document.id,
          data: cloneDeep(document.data),
          schemaId: document.schemaId,
          userId: document.userId ?? '',
        });

        await Promise.all(
          schema.fields.map(async field => {
            const fieldData = data[field.name] ?? null;

            const hookContext: HookContextWithOldData = {
              field,
              fieldData,
              data,
              oldData,
              document,
            };

            data[field.name] = await field.dockiteField!.processInputRaw(hookContext);

            await field.dockiteField!.validateInputRaw(hookContext);

            await field.dockiteField!.onUpdate(hookContext);
          }),
        );

        document.data = { ...document.data, ...data };

        document.userId = userId;

        revisionsToSave.push(revision);
        documentsToSave.push(document);
      }),
    );

    const [savedDocuments] = await Promise.all([
      documentRepository.save(documentsToSave),
      revisionRepository.save(revisionsToSave),
    ]);

    return savedDocuments;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Document,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Document, { nullable: true })
  async restoreDocument(
    @Arg('id', _type => String)
    id: string | null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Document | null> {
    const documentRepository = getRepository(Document);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const document = await documentRepository.findOne({
      where: { id },
      relations: ['schema', 'schema.fields'],
      withDeleted: true,
    });

    if (!document) {
      return null;
    }

    document.deletedAt = null;
    document.userId = userId;

    const savedDocument = documentRepository.save(document);

    return savedDocument;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    derriveAlternativeScopes: false,
  })
  @Mutation(_returns => Boolean)
  async partialUpdateDocumentsInSchemaId(
    @Arg('schemaId', _type => String)
    schemaId: string,
    // @Arg('locale', _type => String, { nullable: true })
    // locale: string | null,
    @Arg('data', _type => GraphQLJSON)
    data: Record<string, any>,
    @Arg('documentIds', _type => [String], { nullable: true })
    documentIds: string[] | null,
    @Ctx() ctx: GlobalContext,
  ): Promise<boolean> {
    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);
    const schemaRepository = getRepository(Schema);

    const { id: userId } = ctx.user!; // eslint-disable-line

    try {
      const schema = await schemaRepository.findOneOrFail(schemaId, { relations: ['fields'] });

      // Fire the update hooks for each field
      await Promise.all(
        schema.fields.map(async field => {
          if (!data[field.name]) {
            return;
          }

          const fieldData = data[field.name] ?? null;

          const hookContext: HookContextWithOldData = {
            field,
            fieldData,
            data,
          };

          data[field.name] = await field.dockiteField!.processInputRaw(hookContext);

          await field.dockiteField!.validateInputRaw(hookContext);

          await field.dockiteField!.onUpdate(hookContext);
        }),
      );

      // Create a collection of params for the following query
      const params: any[] = [schemaId];

      // If we were given a specific set of documents to update add those to
      // the params.
      if (documentIds && documentIds.length > 0) {
        // params.push(documentIds.map(x => `'${x}'`).join(', '));
        params.push(documentIds);
      }

      // Create the corresponding revisions
      await getManager().query(
        `
          INSERT INTO ${
            revisionRepository.metadata.tableName
          }("documentId", "data", "userId", "schemaId")
          SELECT d."id", d."data", d."userId", d."schemaId"
          FROM ${documentRepository.metadata.tableName} d
          WHERE d."schemaId" = $1
          ${documentIds && documentIds.length > 0 ? 'AND d."id"::text = ANY($2)' : ''}
          `,
        params,
      );

      // Stringify the data for the great merge
      const encodedData = JSON.stringify(data);

      const qb = documentRepository
        .createQueryBuilder('document')
        .update()
        .returning('*')
        .set({
          data: () => `data || '${encodedData}'`,
          userId,
        })
        .callListeners(false)
        .where('document."schemaId" = :schemaId', { schemaId });

      // If we were given specific document ids to update filter
      // on those.
      if (documentIds && documentIds.length > 0) {
        qb.andWhereInIds(documentIds);
      }

      const { raw: documents } = await qb.execute();

      await Promise.all(
        documents.map(async (document: Document) => {
          afterUpdate(document);
        }),
      );

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized('internal:document:delete', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Document,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Boolean)
  async removeDocument(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(Document);

    try {
      const document = await repository.findOneOrFail({
        where: { id },
        relations: ['schema', 'schema.fields'],
      });

      const { schema, data } = document;

      await Promise.all(
        schema.fields.map(async field => {
          const fieldData = data[field.name] ?? null;

          field.schema = schema;

          await field.dockiteField!.onSoftDelete({ field, fieldData, data, document });
        }),
      );

      await repository.softRemove(document, { listeners: false });
      await afterRemove(document);

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  }

  @Authenticated()
  @Authorized('internal:document:delete', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Document,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Boolean)
  async permanentlyRemoveDocument(@Arg('id') id: string): Promise<boolean> {
    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);

    try {
      const document = await documentRepository.findOneOrFail({
        where: { id },
        relations: ['schema', 'schema.fields'],
        withDeleted: true,
      });

      const { schema, data } = document;

      await Promise.all(
        schema.fields.map(field => {
          const fieldData = data[field.name] ?? null;

          field.schema = schema;

          return Promise.resolve(
            field.dockiteField!.onPermanentDelete({ field, fieldData, data, document }),
          );
        }),
      );

      await Promise.all([
        documentRepository.remove(document),
        revisionRepository.delete({ documentId: document.id }),
      ]);

      return true;
    } catch {
      return false;
    }
  }

  private makeInitialData(schema: Schema): Record<string, any> {
    return schema.fields.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]:
          curr.settings.default !== undefined
            ? curr.settings.default
            : curr.dockiteField?.defaultValue(),
      }),
      {},
    );
  }
}
