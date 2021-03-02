import { ApolloLink } from '@apollo/client/core';
import { useLocalStorage } from 'vue-composable';

import { AUTH_TOKEN_STORAGE_KEY } from '~/common/constants';
import { useAuth } from '~/hooks/useAuth';

export const refreshTokenLink = new ApolloLink((operation, forward) => {
  const { token: authToken } = useAuth();
  const { storage: tokenStorageDecoded } = useLocalStorage(`${AUTH_TOKEN_STORAGE_KEY}-decoded`, '');

  return forward(operation).map(response => {
    const context = operation.getContext();

    if (context.response && context.response.headers) {
      const { headers } = context.response;

      if (headers.get('authorization')) {
        const [, token] = headers.get('authorization').split('Bearer ');
        const [, claims] = token.split('.');

        const tokenDecoded = atob(claims);

        authToken.value = token;

        tokenStorageDecoded.value = tokenDecoded;
      }
    }

    return response;
  });
});

export const authLink = new ApolloLink((operation, forward) => {
  const { token } = useAuth();

  if (token.value) {
    operation.setContext({
      headers: {
        authorization: `${token.value}`,
      },
    });
  }

  return forward(operation);
});
