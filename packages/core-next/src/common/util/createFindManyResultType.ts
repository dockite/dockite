import { ClassType, Field as GraphQLField, Int, ObjectType } from 'type-graphql';

/**
 * Creates a `FindManyResult` type for a given Entity.
 */
export const createFindManyResultType = <TEntity>(TEntityClass: ClassType<TEntity>): any => {
  /**
   * An abstract class implementing the required fields for a `FindManyResult` type.
   */
  @ObjectType({ isAbstract: true })
  abstract class FindManyResultType {
    @GraphQLField(_type => [TEntityClass])
    results!: TEntity[];

    @GraphQLField(_type => Int)
    totalItems!: number;

    @GraphQLField(_type => Int)
    currentPage!: number;

    @GraphQLField(_type => Int)
    totalPages!: number;

    @GraphQLField(_type => Boolean)
    hasNextPage!: boolean;
  }

  return FindManyResultType;
};

export default createFindManyResultType;
