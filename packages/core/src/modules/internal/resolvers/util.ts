import { Document } from '@dockite/database';
import { Arg, Field as GraphQLField, Int, ObjectType, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';

import { Authenticated } from '../../../common/decorators';

@ObjectType()
class ManyReferences {
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

@Resolver()
export class UtilResolver {
  @Authenticated()
  @Query(_returns => ManyReferences, { nullable: true })
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
  ): Promise<ManyReferences> {
    const qb = getRepository(Document)
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.schema', 'schema')
      .andWhere('schema.id = :schemaId', { schemaId })
      .andWhere(`document.data -> :field ->> 'id' = :documentId`, {
        field: fieldName,
        documentId,
      });

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
}
