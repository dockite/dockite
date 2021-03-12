import { ObjectType } from 'type-graphql';

import { AuthenticationResponse } from './authenticationResponse';

/**
 * The object for login related responses.
 */
@ObjectType()
export class LoginResponse extends AuthenticationResponse {}

export default LoginResponse;
