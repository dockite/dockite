import jwtDecode from 'jwt-decode';
import { reactive } from 'vue';
import { useLocalStorage } from 'vue-composable';

import { LoginPayload, RegisterPayload, UseAuthHook, UseAuthState } from './types';

import { AUTH_TOKEN_STORAGE_KEY } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { MaybePromise } from '~/common/types';
import { useConfig } from '~/hooks/useConfig';
import { internal } from '~/providers/auth';

const state: UseAuthState = reactive({
  authenticated: false,
  type: 'internal',
  user: null,
});

const { storage: tokenStorage } = useLocalStorage(AUTH_TOKEN_STORAGE_KEY, '');

export const useAuth = (): UseAuthHook => {
  const config = useConfig();

  if (config.app.authProvider !== 'internal') {
    state.type = 'third-party';
  }

  const now = Date.now() / 1000;

  if (!state.authenticated) {
    if (tokenStorage.value && jwtDecode<{ exp: number }>(tokenStorage.value).exp > now) {
      state.authenticated = true;
    }
  }

  // eslint-disable-next-line consistent-return
  const handleInitProvider = (): MaybePromise<void> => {
    if (state.type !== 'internal') {
      if (config.app.authProvider === 'auth0') {
        return import('~/providers/auth/auth0')
          .then(mod =>
            mod.init().then(() => {
              if (mod.state.isAuthenticated && mod.state.token) {
                tokenStorage.value = mod.state.token;

                state.authenticated = true;
              }
            }),
          )
          .then(() => import('~/common/api'))
          .then(({ getMe }) => getMe())
          .then(user => {
            state.user = user;
          });
      }

      throw new ApplicationError(
        `No authentication provider available for: ${config.app.authProvider}`,
        ApplicationErrorCode.NO_AUTH_PROVIDER,
      );
    }
  };

  const handleLogin = (payload: LoginPayload): MaybePromise<string | void> => {
    if (state.type !== 'internal') {
      if (config.app.authProvider === 'auth0') {
        return import('~/providers/auth/auth0').then(mod => mod.login(payload));
      }

      throw new ApplicationError(
        `No authentication provider available for: ${config.app.authProvider}`,
        ApplicationErrorCode.NO_AUTH_PROVIDER,
      );
    }

    return internal
      .login(payload)
      .then(token => {
        tokenStorage.value = token;

        state.authenticated = true;

        return import('~/common/api');
      })
      .then(({ getMe }) => getMe())
      .then(user => {
        state.user = user;
      });
  };

  const handleRefreshUser = (): MaybePromise<void> => {
    return import('~/common/api')
      .then(({ getMe }) => getMe())
      .then(user => {
        state.user = user;
      });
  };

  const handleRegister = (payload: RegisterPayload): MaybePromise<string | void> => {
    if (state.type !== 'internal') {
      if (config.app.authProvider === 'auth0') {
        return import('~/providers/auth/auth0').then(mod => mod.register(payload));
      }

      throw new ApplicationError(
        `No authentication provider available for: ${config.app.authProvider}`,
        ApplicationErrorCode.NO_AUTH_PROVIDER,
      );
    }

    return internal
      .register(payload)
      .then(token => {
        tokenStorage.value = token;

        state.authenticated = true;

        return import('~/common/api');
      })
      .then(({ getMe }) => getMe())
      .then(user => {
        state.user = user;
      });
  };

  const handleRegisterFirstUser = (payload: RegisterPayload): MaybePromise<string | void> => {
    if (state.type !== 'internal') {
      if (config.app.authProvider === 'auth0') {
        return import('~/providers/auth/auth0').then(mod => mod.registerFirstUser(payload));
      }

      throw new ApplicationError(
        `No authentication provider available for: ${config.app.authProvider}`,
        ApplicationErrorCode.NO_AUTH_PROVIDER,
      );
    }

    return internal
      .registerFirstUser(payload)
      .then(token => {
        tokenStorage.value = token;

        state.authenticated = true;

        return import('~/common/api');
      })
      .then(({ getMe }) => getMe())
      .then(user => {
        state.user = user;
      });
  };

  const handleRefreshToken = (): MaybePromise<void> => {
    if (state.type !== 'internal') {
      if (config.app.authProvider === 'auth0') {
        return import('~/providers/auth/auth0').then(mod =>
          mod.refresh().then(() => {
            if (mod.state.token) {
              tokenStorage.value = mod.state.token;

              state.authenticated = true;
            }
          }),
        );
      }

      throw new ApplicationError(
        `No authentication provider available for: ${config.app.authProvider}`,
        ApplicationErrorCode.NO_AUTH_PROVIDER,
      );
    }

    return Promise.resolve();
  };

  const handleLogout = (): MaybePromise<void> => {
    if (state.type !== 'internal') {
      if (config.app.authProvider === 'auth0') {
        return import('~/providers/auth/auth0')
          .then(mod => mod.logout())
          .finally(() => {
            state.user = null;
            state.authenticated = false;
          });
      }

      throw new ApplicationError(
        `No authentication provider available for: ${config.app.authProvider}`,
        ApplicationErrorCode.NO_AUTH_PROVIDER,
      );
    }

    return internal.logout().finally(() => {
      state.user = null;
      state.authenticated = false;
    });
  };

  return {
    state,
    token: tokenStorage,
    handleInitProvider,
    handleLogin,
    handleRegister,
    handleRegisterFirstUser,
    handleRefreshToken,
    handleRefreshUser,
    handleLogout,
  };
};

export default useAuth;
