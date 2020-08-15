import { Plugin } from '@nuxt/types';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';

const refreshTokenLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();

    if (context.response && context.response.headers) {
      const { headers } = context.response;

      if (headers.get('authorization')) {
        const [, token] = headers.get('authorization').split('Bearer ');
        const [, claims] = token.split('.');

        const tokenDecoded = atob(claims);

        window.localStorage.setItem('apollo-token', token);
        window.localStorage.setItem('apollo-token-decoded', tokenDecoded);
      }
    }

    return response;
  });
});

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('apollo-token');

  if (token) {
    operation.setContext({
      headers: {
        authorization: token,
      },
    });
  }

  return forward(operation);
});

const plugin: Plugin = (context, inject) => {
  const apolloClient = new ApolloClient({
    link: ApolloLink.from([
      authLink,
      refreshTokenLink,
      createHttpLink({
        uri: context.env.GRAPHQL_ENDPOINT,
        credentials: 'include',
      }),
    ]),
    cache: new InMemoryCache(),
  });

  inject('apolloClient', apolloClient);
};

export default plugin;
