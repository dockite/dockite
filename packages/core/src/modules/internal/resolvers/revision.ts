import {
  Arg,
  Field as GraphQLField,
  Int,
  ObjectType,
  Query,
  Resolver,
  Mutation,
  Ctx,
} from 'type-graphql';
import { getRepository, getCustomRepository } from 'typeorm';
import { omit, cloneDeep } from 'lodash';
import {
  DocumentRevision,
  SchemaRevision,
  Schema,
  Document,
  SchemaRevisionRepository,
} from '@dockite/database';
import { GlobalContext } from '@dockite/types';

import { Authenticated } from '../../../common/authorizers';

@ObjectType()
class ManySchemaRevisions {
  @GraphQLField(_type => [SchemaRevision])
  results!: SchemaRevision[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@ObjectType()
class ManyDocumentRevisions {
  @GraphQLField(_type => [DocumentRevision])
  results!: DocumentRevision[];

  @GraphQLField(_type => Int)
  totalItems!: number;

  @GraphQLField(_type => Int)
  currentPage!: number;

  @GraphQLField(_type => Int)
  totalPages!: number;

  @GraphQLField(_type => Boolean)
  hasNextPage!: boolean;
}

@Resolver()
export class RevisionResolver {
  @Query(_returns => ManySchemaRevisions, { nullable: true })
  public async allSchemaRevisions(
    @Arg('schemaId', _type => String)
    schemaId: string,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManySchemaRevisions> {
    const revisionRepository = getRepository(SchemaRevision);
    const schemaRepository = getRepository(Schema);

    const [schema, revisions] = await Promise.all([
      schemaRepository.findOneOrFail(schemaId, { relations: ['user', 'fields'] }),
      revisionRepository.findAndCount({
        where: { schemaId },
        relations: ['user'],
        take: perPage,
        order: { updatedAt: 'DESC' },
      }),
    ]);

    const [results, totalItems] = revisions;

    schema.fields = schema.fields.map(field => omit(field, ['dockiteField']));

    const schemaToRevision: Omit<SchemaRevision, 'schema'> = {
      id: 'current',
      createdAt: schema.updatedAt,
      data: omit(schema, ['user']),
      schemaId: schema.id,
      updatedAt: schema.updatedAt,
      user: schema.user,
      userId: schema.userId,
    };

    return {
      results: [schemaToRevision, ...results],
      totalItems: totalItems + 1,
      currentPage: 1,
      hasNextPage: false,
      totalPages: 1,
    };
  }

  @Query(_returns => ManyDocumentRevisions, { nullable: true })
  public async allDocumentRevisions(
    @Arg('documentId', _type => String)
    documentId: string,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyDocumentRevisions> {
    const revisionRepository = getRepository(DocumentRevision);
    const documentRepository = getRepository(Document);

    const [document, revisions] = await Promise.all([
      documentRepository.findOneOrFail(documentId, { relations: ['user'] }),
      revisionRepository.findAndCount({
        where: { documentId },
        relations: ['user'],
        take: perPage,
        order: { updatedAt: 'DESC' },
      }),
    ]);

    const [results, totalItems] = revisions;

    const documentToRevision: DocumentRevision = {
      id: 'current',
      data: cloneDeep(document.data),
      createdAt: document.updatedAt,
      updatedAt: document.updatedAt,
      documentId: document.id,
      user: document.user,
      userId: document.userId,
    };

    return {
      results: [documentToRevision, ...results],
      totalItems: totalItems + 1,
      currentPage: 1,
      hasNextPage: false,
      totalPages: 1,
    };
  }

  @Authenticated()
  @Mutation(_returns => Boolean)
  async restoreSchemaRevision(
    @Arg('revisionId', _type => String)
    revisionId: string,
    @Arg('schemaId', _type => String)
    schemaId: string,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    try {
      const { id: userId } = ctx.user!; // eslint-disable-line

      const repository = getCustomRepository(SchemaRevisionRepository);

      await repository.restoreRevision(schemaId, revisionId, userId);

      return true;
    } catch (err) {
      console.log(err);

      return false;
    }
  }

  @Authenticated()
  @Mutation(_returns => Boolean)
  async restoreDocumentRevision(
    @Arg('revisionId', _type => String)
    revisionId: string,
    @Arg('documentId', _type => String)
    documentId: string,
    @Ctx()
    ctx: GlobalContext,
  ): Promise<boolean> {
    const { id: userId } = ctx.user!; // eslint-disable-line

    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);

    try {
      const [document, revision] = await Promise.all([
        documentRepository.findOneOrFail({ where: { id: documentId } }),
        revisionRepository.findOneOrFail({ where: { id: revisionId } }),
      ]);

      const newRevision = revisionRepository.create({
        documentId: document.id,
        data: cloneDeep(document.data),
        userId: document.userId ?? '',
      });

      document.data = revision.data;
      document.userId = userId;

      await Promise.all([documentRepository.save(document), revisionRepository.save(newRevision)]);

      return true;
    } catch {
      return false;
    }
  }
}
