import GraphQLJSON from 'graphql-type-json';
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

import { Authenticated } from '../../../common/authorizers';
import { GlobalContext } from '../../../common/types';
import { Document } from '../../../entities';

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

    return document ?? null;
  }

  @Authenticated()
  @Query(_type => ManyDocuments)
  async findDocuments(
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
    @Arg('schemaIds', _type => [String], { nullable: true })
    schemaIds: string | null,
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyDocuments> {
    const repository = getRepository(Document);

    const qb = repository
      .createQueryBuilder('document')
      .where('document.deletedAt IS NULL')
      .leftJoinAndSelect('document.schema', 'schema');

    if (schemaId) {
      qb.andWhere('document.schemaId = :schemaId', { schemaId });
    }

    if (schemaIds) {
      qb.andWhere('document.schemaId IN (:...schemaIds)', { schemaIds });
    }

    qb.take(perPage)
      .skip(perPage * (page - 1))
      .orderBy('document.updatedAt', 'DESC');

    const [results, totalItems] = await qb.getManyAndCount();

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      results,
      totalItems,
      currentPage: page,
      hasNextPage: page < totalPages,
      totalPages,
    };
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authenticated()
  @Query(_returns => ManyDocuments)
  async allDocuments(
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<ManyDocuments> {
    const repository = getRepository(Document);

    const [results, totalItems] = await repository.findAndCount({
      where: { deletedAt: null },
      relations: ['schema'],
      order: { updatedAt: 'DESC' },
      take: perPage,
      skip: perPage * (page - 1),
    });

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
  @Mutation(_returns => Document)
  async createDocument(
    @Arg('locale') locale: string,
    @Arg('data', _type => GraphQLJSON) data: any, // eslint-disable-line
    @Arg('schemaId') schemaId: string,
    @Arg('releaseId', _type => String, { nullable: true }) releaseId: string | null = null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Document | null> {
    const repository = getRepository(Document);

    const { id: userId } = ctx.user!; // eslint-disable-line

    const document = repository.create({
      locale,
      data,
      schemaId,
      releaseId,
      userId,
    });

    const savedDocument = await repository.save(document);

    return savedDocument;
  }

  @Authenticated()
  @Mutation(_returns => Document, { nullable: true })
  async updateDocument(
    @Arg('id', _type => String, { nullable: true })
    id: string | null,
    // @Arg('locale', _type => String, { nullable: true })
    // locale: string | null,
    @Arg('data', _type => GraphQLJSON, { nullable: true })
    data: any | null, // eslint-disable-line
    @Ctx() _ctx: GlobalContext,
  ): Promise<Document | null> {
    const repository = getRepository(Document);

    // const { id: userId } = ctx.user!; // eslint-disable-line

    const document = await repository.findOne({
      where: { id, deletedAt: null },
    });

    if (!document) {
      return null;
    }

    if (data) {
      document.data = data;
    }

    const savedDocument = await repository.save(document);

    return savedDocument;
  }

  @Authenticated()
  @Mutation(_returns => Boolean)
  async removeDocument(@Arg('id') id: string): Promise<boolean> {
    const repository = getRepository(Document);

    try {
      const document = await repository.findOneOrFail({ where: { id } });

      await repository.remove(document);

      return true;
    } catch {
      return false;
    }
  }
}
