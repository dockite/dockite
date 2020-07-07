import { Plugin } from '@nuxt/types';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';

const refreshTokenLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();

    const { headers } = context;

    if (headers.authorization) {
      const [, token] = headers.authorization.split('Bearer ');
      const [, claims] = token.split('.');

      const tokenDecoded = atob(claims);

      window.localStorage.setItem('apollo-token', token);
      window.localStorage.setItem('apollo-token-decoded', tokenDecoded);
    }

    return response;
  });
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('apollo-token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
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
