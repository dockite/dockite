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
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { FindManyOptions, getCustomRepository, getRepository, IsNull, Not } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { GlobalContext } from '../../../common/types';
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
      relations: ['schema', 'schema.fields'],
    });

    if (!document) {
      return null;
    }

    await Promise.all(
      document.schema.fields.map(async field => {
        document.data[field.name] = await field.dockiteField!.processOutputRaw({
          data: document.data,
          field,
          fieldData: document.data[field.name] ?? null,
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
  ): Promise<ManyDocuments> {
    const repository = getRepository(Document);

    const qb = repository
      .createQueryBuilder('document')
      .where('document.deletedAt IS NULL')
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

    qb.take(perPage).skip(perPage * (page - 1));

    const [results, totalItems] = await qb.getManyAndCount();

    await Promise.all(
      results.map(async item => {
        await Promise.all(
          item.schema.fields.map(async field => {
            item.data[field.name] = await field.dockiteField!.processOutputRaw({
              data: item.data,
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
    @Arg('sort', _type => SortInputType, { nullable: true })
    sort: SortInputType | null,
  ): Promise<ManyDocuments> {
    const repository = getRepository(Document);

    const findOptions: FindManyOptions = {
      relations: ['schema', 'schema.fields'],
      order: { updatedAt: 'DESC' },
      take: perPage,
      skip: perPage * (page - 1),
    };

    if (sort) {
      findOptions.order = { [sort.name]: sort.direction };
    }

    const [results, totalItems] = await repository.findAndCount(findOptions);

    await Promise.all(
      results.map(async item => {
        await Promise.all(
          item.schema.fields.map(async field => {
            item.data[field.name] = await field.dockiteField!.processOutputRaw({
              data: item.data,
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
  })
  @Query(_returns => ManyDocuments)
  async searchDocuments(
    @Arg('term', _type => String)
    term: string,
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
    @Arg('sort', _type => SortInputType, { nullable: true })
    sort: SortInputType | null,
  ): Promise<ManyDocuments> {
    const repository = getCustomRepository(SearchEngineRepository);

    const qb = repository
      .search(term)
      .andWhere('searchEngine.deletedAt IS NULL')
      .leftJoinAndSelect('searchEngine.schema', 'schema')
      .leftJoinAndSelect('schema.fields', 'fields')
      .take(perPage)
      .skip(perPage * (page - 1));

    if (sort) {
      qb.orderBy(`searchEngine.${strToColumnPath(sort.name)}`, sort.direction);
    } else {
      qb.orderBy('searchEngine.updatedAt', 'DESC');
    }

    if (schemaId && schemaId !== '') {
      qb.andWhere('searchEngine.schemaId = :schemaId', { schemaId });
    }

    const [results, totalItems] = await qb.getManyAndCount();

    await Promise.all(
      results.map(async item => {
        await Promise.all(
          item.schema.fields.map(async field => {
            item.data[field.name] = await field.dockiteField!.processOutputRaw({
              data: item.data,
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

    const initialData: Record<string, null> = schema.fields.reduce(
      (acc, curr) => ({ ...acc, [curr.name]: null }),
      {},
    );

    const document = documentRepository.create({
      locale,
      data: { ...initialData, ...data },
      schemaId,
      releaseId,
      userId,
    });

    await Promise.all(
      schema.fields.map(async field => {
        const fieldData = data[field.name] ?? null;

        const hookContext: HookContext = { field, fieldData, data: document.data };

        await Promise.resolve([
          field.dockiteField!.onCreate(hookContext),
          field.dockiteField!.validateInputRaw(hookContext),
        ]);
      }),
    );

    const savedDocument = await documentRepository.save(document);

    return savedDocument;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    resourceType: 'schema',
  })
  @Mutation(_returns => Document, { nullable: true })
  async updateDocument(
    @Arg('id', _type => String)
    id: string | null,
    // @Arg('locale', _type => String, { nullable: true })
    // locale: string | null,
    @Arg('data', _type => GraphQLJSON)
    data: any | null, // eslint-disable-line
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
      userId: document.userId ?? '',
    });

    if (data) {
      document.data = { ...document.data, ...data };
    }

    await Promise.all(
      schema.fields.map(async field => {
        const fieldData = document.data[field.name] ?? null;

        const hookContext: HookContextWithOldData = {
          field,
          fieldData,
          data: document.data,
          oldData,
        };

        await Promise.all([
          field.dockiteField!.validateInputRaw(hookContext),
          field.dockiteField!.processInputRaw(hookContext),
          field.dockiteField!.onUpdate(hookContext),
        ]);
      }),
    );

    document.userId = userId;

    const [savedDocument] = await Promise.all([
      documentRepository.save(document),
      revisionRepository.save(revision),
    ]);

    return savedDocument;
  }

  @Authenticated()
  @Authorized('internal:document:delete', {
    resourceType: 'schema',
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
        schema.fields.map(field => {
          const fieldData = data[field.name] ?? null;

          return Promise.resolve(field.dockiteField!.onSoftDelete({ field, fieldData, data }));
        }),
      );

      await repository.softRemove(document);

      return true;
    } catch {
      return false;
    }
  }

  @Authenticated()
  @Mutation(_returns => Boolean)
  async permanentlyRemoveDocument(@Arg('id') id: string): Promise<boolean> {
    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);

    try {
      const document = await documentRepository.findOneOrFail({
        where: { id, deletedAt: Not(IsNull()) },
        relations: ['schema', 'schema.fields'],
      });

      const { schema, data } = document;

      await Promise.all(
        schema.fields.map(field => {
          const fieldData = data[field.name] ?? null;

          return Promise.resolve(field.dockiteField!.onPermanentDelete({ field, fieldData, data }));
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
}
