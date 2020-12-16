import { AuthenticationError, AuthenticationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import {
  LoginMutationResponse,
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  RegisterFirstUserMutationResponse,
  REGISTER_FIRST_USER_MUTATION,
} from '~/graphql';
import { LoginPayload, RegisterPayload } from '~/hooks/useAuth/types';
import { useGraphQL } from '~/hooks/useGraphQL';

export const init = (...args: any): void => {
  // no-op
};

/**
 * Logs the user in using the corresponding GraphQL mutation, throws an error
 * if invalid credentials are recieved.
 *
 * @param payload The payload used to perform a login action
 */
export const login = async (payload: LoginPayload): Promise<string> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeMutation<LoginMutationResponse, LoginPayload>({
      mutation: LOGIN_MUTATION,
      variables: payload,
    });

    if (!result.data || !result.data.login) {
      throw new AuthenticationError(
        'Unknown authentication error occurred',
        AuthenticationErrorCode.UKNOWN_ERROR,
      );
    }

    return result.data.login.token;
  } catch (e) {
    logE(e);

    throw new AuthenticationError(
      'The username or password provided were incorrect',
      AuthenticationErrorCode.UKNOWN_CREDENTIALS,
    );
  }
};

export const register = async (...args: any): Promise<string> => {
  throw new Error('Registration is not implemented for internal authentication');
};

export const registerFirstUser = async (payload: RegisterPayload): Promise<string> => {
  const graphql = useGraphQL();

  try {
    const result = await graphql.executeMutation<
      RegisterFirstUserMutationResponse,
      RegisterPayload
    >({
      mutation: REGISTER_FIRST_USER_MUTATION,
      variables: payload,
    });

    if (!result.data || !result.data.registerFirstUser) {
      throw new AuthenticationError(
        'Unknown error occurred during registration',
        AuthenticationErrorCode.UKNOWN_ERROR,
      );
    }

    return result.data.registerFirstUser.token;
  } catch (e) {
    logE(e);

    throw new AuthenticationError(
      'Unable to register first user for application',
      AuthenticationErrorCode.NO_FIRST_USER,
    );
  }
};

export const logout = async (): Promise<void> => {
  const graphql = useGraphQL();

  try {
    await graphql.executeMutation({
      mutation: LOGOUT_MUTATION,
    });
  } catch (e) {
    logE(e);

    throw new AuthenticationError(
      'An unknown error occurred during logout',
      AuthenticationErrorCode.UKNOWN_ERROR,
    );
  }
};
