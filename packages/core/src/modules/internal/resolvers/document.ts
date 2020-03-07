import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { GlobalContext } from '../../../common/types';
import { Document } from '../../../entities';

const repository = getRepository(Document);

@Resolver(_of => Document)
export class DocumentResolver {
  @Authorized()
  @Query(_returns => Document, { nullable: true })
  async getDocument(@Arg('id') id: string): Promise<Document | null> {
    const document = await repository.findOne({ where: { id } });

    return document ?? null;
  }

  /**
   * TODO: Move this to and Connection/Edge model
   */
  @Authorized()
  @Query(_returns => [Document])
  async allDocuments(): Promise<Document[] | null> {
    const documents = await repository.find();

    return documents ?? null;
  }

  @Authorized()
  @Mutation(_returns => Document)
  async createDocument(
    @Arg('locale') locale: string,
    @Arg('data') data: any, // eslint-disable-line
    @Arg('schemaId') schemaId: string,
    @Arg('releaseId', { nullable: true }) releaseId: string | null = null,
    @Ctx() ctx: GlobalContext,
  ): Promise<Document | null> {
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
  @Mutation(_returns => Boolean)
  async removeDocument(@Arg('id') id: string): Promise<boolean> {
    try {
      const document = await repository.findOneOrFail({ where: { id } });

      await repository.remove(document);

      return true;
    } catch {
      return false;
    }
  }
}
