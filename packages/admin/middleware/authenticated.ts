import { Middleware } from '@nuxt/types';

import MeQuery from '~/graphql/queries/me.gql';

export interface ApolloTokenDecoded {
  exp: number;
}

const authenticated: Middleware = async ({ redirect, app }) => {
  if (process.client) {
    const apolloTokenDecodedRaw = window.localStorage.getItem('apollo-token-decoded');

    if (!apolloTokenDecodedRaw) {
      return redirect('/login');
    }

    const apolloTokenDecoded: ApolloTokenDecoded = JSON.parse(apolloTokenDecodedRaw);

    if (Date.now() / 1000 > apolloTokenDecoded.exp) {
      try {
        await app.$apolloClient.query({
          query: MeQuery,
        });
      } catch (err) {
        window.localStorage.removeItem('apollo-token');
        window.localStorage.removeItem('apollo-token-decoded');

        return redirect('/login');
      }
    }
  }
};

export default authenticated;
