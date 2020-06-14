import { Field as GraphQLField, ObjectType } from 'type-graphql';
import { User } from '@dockite/database';

import { UserContext } from '../../../common/types';

@ObjectType()
export class AuthenticationResponse {
  @GraphQLField(_returns => User)
  user!: UserContext;

  @GraphQLField(_returns => String)
  token!: string;
}
