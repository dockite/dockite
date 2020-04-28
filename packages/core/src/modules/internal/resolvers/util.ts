import { Resolver, Query, Int, Arg } from 'type-graphql';
import { getRepository } from 'typeorm';

import { Document } from '../../../entities';

@Resolver()
export class UtilResolver {
  @Query(_returns => [Document], { nullable: true })
  public async resolveReferenceOf(
    @Arg('documentId', _type => String)
    documentId: string,
    @Arg('schemaId', _type => String)
    schemaId: string,
    @Arg('fieldName', _type => String)
    fieldName: string,
    @Arg('page', _type => Int, { defaultValue: 1 })
    page: number,
    @Arg('perPage', _type => Int, { defaultValue: 20 })
    perPage: number,
  ): Promise<Document[]> {
    const qb = getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .andWhere('schema.id = :schemaId', { schemaId })
      .andWhere(`document.data -> :field ->> 'id' = :documentId`, {
        field: fieldName,
        documentId,
      })
      .limit(perPage)
      .offset((page - 1) * perPage);

    const documents: Document[] = await qb.getMany();

    return documents;
  }
}
