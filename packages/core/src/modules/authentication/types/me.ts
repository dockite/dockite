import { ObjectType, Field as GraphQLField } from 'type-graphql';

import { UserContext } from '../../../common/types';

@ObjectType()
export class Me implements UserContext {
  @GraphQLField()
  public id!: string;

  @GraphQLField()
  public firstName!: string;

  @GraphQLField()
  public lastName!: string;

  @GraphQLField()
  public email!: string;

  @GraphQLField()
  public createdAt!: Date;

  @GraphQLField()
  public updatedAt!: Date;

  @GraphQLField()
  public verified!: boolean;
}
