import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { GlobalContext } from '../../../common/types';
import { Document } from '../../../entities';

@Resolver(_of => Document)
export class DocumentResolver {
  @Authorized()
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

  @Authorized()
  @Query(_returns => [Document], { nullable: true })
  async findDocuments(
    @Arg('schemaId', _type => String, { nullable: true })
    schemaId: string | null,
  ): Promise<Document[] | null> {
    const repository = getRepository(Document);

    const qb = repository.createQueryBuilder('document').where('document.deletedAt IS NULL');

    if (schemaId) {
      qb.andWhere('document.schemaId = :schemaId', { schemaId });
    }

    qb.orderBy('document.updatedAt', 'DESC');

    const documents = await qb.getMany();

    return documents ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authorized()
  @Query(_returns => [Document])
  async allDocuments(): Promise<Document[] | null> {
    const repository = getRepository(Document);

    const documents = await repository.find({
      where: { deletedAt: null },
      relations: ['schema'],
      order: { updatedAt: 'DESC' },
    });

    return documents ?? null;
  }

  @Authorized()
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

  @Authorized()
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

  @Authorized()
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
