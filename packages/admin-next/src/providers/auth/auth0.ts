import { Auth0Client } from '@auth0/auth0-spa-js';
import { reactive } from 'vue';

import { Auth0AuthConfiguration } from '@dockite/types';

import { AuthenticationError, AuthenticationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { RegisterFirstUserMutationResponse, REGISTER_FIRST_USER_MUTATION } from '~/graphql';
import { RegisterPayload } from '~/hooks/useAuth/types';
import { useConfig } from '~/hooks/useConfig';

interface Auth0State {
  client: Auth0Client | null;
  loading: boolean;
  isAuthenticated: boolean;
  popupOpen: boolean;
  error: any;
  token: string | null;
}

export const state: Auth0State = reactive({
  client: null,
  loading: false,
  isAuthenticated: false,
  popupOpen: false,
  error: null,
  token: null,
});

(window as any).auth0 = state;

export const init = async (): Promise<void> => {
  const config = useConfig();

  const authConfig = config.auth as Auth0AuthConfiguration;

  if (!state.client) {
    state.client = new Auth0Client({
      client_id: authConfig.clientId,
      domain: authConfig.domain,
      redirect_uri: authConfig.redirectUri,
    });
  }

  state.popupOpen = true;

  try {
    await state.client.loginWithPopup();

    state.token = await state.client
      .getTokenSilently()
      .then(() => state.client?.getIdTokenClaims())
      // eslint-disable-next-line no-underscore-dangle
      .then(claims => claims?.__raw ?? null);

    state.isAuthenticated = true;
  } catch (e) {
    console.error(e);
  } finally {
    state.popupOpen = false;
  }
};

export const login = (...args: any): string => {
  throw new Error('Login not implemented for Auth0 provider');
};

export const register = (...args: any): string => {
  throw new Error('Registration not implemented for Auth0 provider');
};

export const registerFirstUser = async (payload: RegisterPayload): Promise<string> => {
  const graphql = await import('~/hooks/useGraphQL').then(mod => mod.useGraphQL());

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

export const refresh = async (): Promise<void> => {
  const config = useConfig();

  const authConfig = config.auth as Auth0AuthConfiguration;

  if (!state.client) {
    state.client = new Auth0Client({
      client_id: authConfig.clientId,
      domain: authConfig.domain,
      redirect_uri: authConfig.redirectUri,
    });
  }

  if (state.client) {
    state.token = await state.client
      .getTokenSilently()
      .then(() => state.client?.getIdTokenClaims())
      // eslint-disable-next-line no-underscore-dangle
      .then(claims => claims?.__raw ?? null);
  }
};

export const logout = (): void => {
  const config = useConfig();

  const authConfig = config.auth as Auth0AuthConfiguration;

  if (state.client) {
    state.client.logout({ returnTo: '/', client_id: authConfig.clientId, localOnly: true });
  }
};
