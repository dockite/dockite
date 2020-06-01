import { Middleware } from '@nuxt/types';

export interface ApolloTokenDecoded {
  exp: number;
}

const authenticated: Middleware = ({ redirect }) => {
  if (process.client) {
    const apolloTokenDecodedRaw = window.localStorage.getItem('apollo-token-decoded');

    if (!apolloTokenDecodedRaw) {
      return redirect('/login');
    }

    const apolloTokenDecoded: ApolloTokenDecoded = JSON.parse(apolloTokenDecodedRaw);

    if (Date.now() / 1000 > apolloTokenDecoded.exp) {
      window.localStorage.removeItem('apollo-token');
      window.localStorage.removeItem('apollo-token-decoded');

      return redirect('/login');
    }
  }
};

export default authenticated;
