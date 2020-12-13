/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Document, Draft, Schema } from '@dockite/database';
import { DockiteFieldValidationError, HookContextWithOldData } from '@dockite/types';
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
import { getRepository } from 'typeorm';

import { Authenticated, Authorized } from '../../../common/decorators';
import { GlobalContext } from '../../../common/types';
import { DocumentValidationError } from '../../../errors/validation';
import { strToColumnPath } from '../../../utils';

import { SortInputType } from './inputs/sort';

@ObjectType()
class ManyDrafts {
  @GraphQLField(_type => [Draft])
  results!: Draft[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver(_of => Draft)
export class DraftResolver {
  @Authenticated()
  @Authorized('internal:document:read', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Query(_returns => Draft, { nullable: true })
  async getDraft(
    @Arg('id')
    id: string,
  ): Promise<Draft | null> {
    const repository = getRepository(Draft);

    const draft = await repository.findOne({
      where: { id },
      relations: ['schema', 'schema.fields', 'user'],
      withDeleted: true,
    });

    if (!draft) {
      return null;
    }

    await Promise.all(
      draft.schema.fields.map(async field => {
        draft.data[field.name] = await field.dockiteField!.processOutputRaw({
          data: { id: draft.id, ...draft.data },
          field,
          fieldData: draft.data[field.name] ?? null,
          document: draft,
        });
      }),
    );

    return draft;
  }

  @Authenticated()
  @Authorized('internal:document:read', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Query(_returns => ManyDrafts)
  async allDraftsForDocument(
    @Arg('documentId', _type => String)
    documentId: string,
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
  ): Promise<ManyDrafts> {
    const repository = getRepository(Draft);

    const qb = repository
      .createQueryBuilder('draft')
      .leftJoinAndSelect('draft.schema', 'schema')
      .leftJoinAndSelect('schema.fields', 'fields')
      .where('draft."documentId" = :documentId', { documentId })
      .take(perPage)
      .skip(perPage * (page - 1));

    if (sort) {
      qb.orderBy(`draft.${strToColumnPath(sort.name)}`, sort.direction);
    } else {
      qb.orderBy('draft.updatedAt', 'DESC');
    }

    qb.addOrderBy('draft.id');

    if (where) {
      WhereBuilder.Build(qb, where);
    }

    if (deleted) {
      qb.andWhere('draft.deletedAt IS NOT NULL').withDeleted();
    } else {
      qb.andWhere('draft.deletedAt IS NULL');
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
  @Authorized('internal:document:create', {
    resourceType: 'schema',
    fieldsOrArgsToPeek: ['schemaId'],
  })
  @Mutation(_returns => Draft)
  async createDraft(
    @Arg('name') name: string,
    @Arg('locale') locale: string,
    @Arg('data', _type => GraphQLJSON) data: any,
    @Arg('documentId') documentId: string,
    @Arg('schemaId') schemaId: string,
    @Arg('releaseId', _type => String, { nullable: true }) releaseId: string | null = null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Draft | null> {
    const draftRepository = getRepository(Draft);
    const documentRepository = getRepository(Document);
    const schemaRepository = getRepository(Schema);

    const [schema] = await Promise.all([
      schemaRepository.findOneOrFail({
        where: { id: schemaId, deletedAt: null },
        relations: ['fields'],
      }),
      documentRepository.findOneOrFail({
        where: { id: documentId, deletedAt: null },
      }),
    ]);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const input = { ...this.makeInitialData(schema), ...data };

    await this.callLifeCycleHooks(schema, input, 'processInputRaw', true);
    await this.callLifeCycleHooks(schema, input, 'validateInputRaw');
    await this.callLifeCycleHooks(schema, input, 'onCreate');

    const draft = draftRepository.create({
      name,
      locale,
      data: input,
      schemaId,
      documentId,
      schema,
      releaseId,
      userId,
    });

    const savedDraft = await draftRepository.save(draft);

    return savedDraft;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Draft,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Draft, { nullable: true })
  async updateDraft(
    @Arg('id', _type => String)
    id: string,
    @Arg('name', _type => String)
    name: string,
    // @Arg('locale', _type => String, { nullable: true })
    // locale: string | null,
    @Arg('data', _type => GraphQLJSON)
    data: Record<string, any>, // eslint-disable-line
    @Ctx() ctx: GlobalContext,
  ): Promise<Draft | null> {
    const draftRepository = getRepository(Draft);

    const validationErrors: Record<string, string> = {};

    const { id: userId } = ctx.user!; // eslint-disable-line

    const draft = await draftRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['schema', 'schema.fields'],
    });

    if (!draft) {
      return null;
    }

    const { schema } = draft;

    const oldData = cloneDeep(draft.data);

    await this.callLifeCycleHooks(schema, data, 'processInputRaw', true, draft, oldData);
    await this.callLifeCycleHooks(schema, data, 'validateInputRaw', false, draft, oldData);
    await this.callLifeCycleHooks(schema, data, 'onUpdate', false, draft, oldData);

    if (Object.keys(validationErrors).length > 0) {
      throw new DocumentValidationError(validationErrors);
    }

    draft.name = name;

    draft.data = { ...draft.data, ...data };

    draft.userId = userId;

    const savedDraft = await draftRepository.save(draft);

    return savedDraft;
  }

  @Authenticated()
  @Authorized('internal:document:update', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Draft,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Draft, { nullable: true })
  async restoreDraft(
    @Arg('id', _type => String)
    id: string | null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Draft | null> {
    const draftRepository = getRepository(Draft);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const draft = await draftRepository.findOne({
      where: { id },
      relations: ['schema', 'schema.fields'],
      withDeleted: true,
    });

    if (!draft) {
      return null;
    }

    draft.deletedAt = null;
    draft.userId = userId;

    const savedDraft = draftRepository.save(draft);

    return savedDraft;
  }

  @Authenticated()
  @Authorized('internal:document:delete', {
    resourceType: 'schema',
    lookAhead: true,
    fieldsOrArgsToPeek: ['schemaId'],
    entity: Draft,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Boolean)
  async removeDraft(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(Draft);

    try {
      const draft = await repository.findOneOrFail({
        where: { id },
        relations: ['schema', 'schema.fields'],
      });

      const { schema, data } = draft;

      await Promise.all(
        schema.fields.map(async field => {
          const fieldData = data[field.name] ?? null;

          field.schema = schema;

          await field.dockiteField!.onSoftDelete({ field, fieldData, data, document: draft });
        }),
      );

      await repository.softRemove(draft, { listeners: false });
      // await afterRemove(draft);

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
    entity: Draft,
    entityIdArg: 'id',
  })
  @Mutation(_returns => Boolean)
  async permanentlyRemoveDraft(@Arg('id') id: string): Promise<boolean> {
    const draftRepository = getRepository(Draft);

    try {
      const draft = await draftRepository.findOneOrFail({
        where: { id },
        relations: ['schema', 'schema.fields'],
        withDeleted: true,
      });

      const { schema, data } = draft;

      await Promise.all(
        schema.fields.map(field => {
          const fieldData = data[field.name] ?? null;

          field.schema = schema;

          return Promise.resolve(
            field.dockiteField!.onPermanentDelete({ field, fieldData, data, document: draft }),
          );
        }),
      );

      await draftRepository.remove(draft);

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

  private async callLifeCycleHooks(
    schema: Schema,
    data: Record<string, any>,
    hook:
      | 'processInputRaw'
      | 'onCreate'
      | 'onUpdate'
      | 'onSoftDelete'
      | 'onPermanentDelete'
      | 'validateInputRaw',
    mutates = false,
    draft?: Draft,
    oldData?: Record<string, any>,
  ): Promise<void> {
    const validationErrors: Record<string, string> = {};

    await Promise.all(
      schema.fields.map(async field => {
        if (!field.dockiteField) {
          throw new Error(`dockiteField failed to map for ${field.name} of ${schema.name}`);
        }

        // Skip fields which don't exist (resolves bulk-update issues)
        if (data[field.name] === undefined) {
          return;
        }

        const fieldData = data[field.name] ?? null;

        const hookContext: HookContextWithOldData = {
          field,
          fieldData,
          data,
          oldData,
          document: draft,
          path: field.name,
          draft: true,
        };

        try {
          if (mutates) {
            data[field.name] = await field.dockiteField[hook](hookContext);
          } else {
            await field.dockiteField[hook](hookContext);
          }
        } catch (err) {
          if (err instanceof DockiteFieldValidationError) {
            validationErrors[err.path] = err.message;

            if (err.children) {
              err.children.forEach(e => {
                validationErrors[e.path] = e.message;
              });
            }

            throw new DocumentValidationError(validationErrors);
          }
        }
      }),
    );
  }
}
