import { ObjectType, Field as GraphQLField } from 'type-graphql';

import { User } from '@dockite/database';

/**
 * The base object for authentication related responses.
 */
@ObjectType()
export class AuthenticationResponse {
  @GraphQLField(_returns => User)
  user!: Omit<User, 'password'>;

  @GraphQLField(_returns => String)
  token!: string;
}

export default AuthenticationResponse;
