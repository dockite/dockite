import { Arg, Field as GraphQLField, Int, ObjectType, Query, Resolver } from 'type-graphql';
import { getRepository } from 'typeorm';
import { omit } from 'lodash';
import { SchemaRevision, Schema } from '@dockite/database';

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

@Resolver()
export class RevisionResolver {
  @Query(_returns => ManySchemaRevisions, { nullable: true })
  public async allSchemaRevisions(
    @Arg('schemaId', _type => String)
    schemaId: string,
    @Arg('perPage', _type => Int, { nullable: true })
    perPage: number | null,
  ): Promise<ManySchemaRevisions> {
    const revisionRepository = getRepository(SchemaRevision);
    const schemaRepository = getRepository(Schema);

    const [schema, revisions] = await Promise.all([
      schemaRepository.findOneOrFail(schemaId, { relations: ['user', 'fields'] }),
      revisionRepository.findAndCount({
        where: { schemaId },
        relations: ['user'],
        take: perPage ?? undefined,
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
}
