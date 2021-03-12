import { ObjectType } from 'type-graphql';

import { AuthenticationResponse } from './authenticationResponse';

/**
 * The object for registration related responses.
 */
@ObjectType()
export class RegistrationResponse extends AuthenticationResponse {}

export default RegistrationResponse;
