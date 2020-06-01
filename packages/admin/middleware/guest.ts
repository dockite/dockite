import { Middleware } from '@nuxt/types';

export interface ApolloTokenDecoded {
  exp: number;
}

const guest: Middleware = ({ redirect }) => {
  if (process.client) {
    const apolloTokenDecodedRaw = window.localStorage.getItem('apollo-token-decoded');

    if (!apolloTokenDecodedRaw) {
      return;
    }

    const apolloTokenDecoded: ApolloTokenDecoded = JSON.parse(apolloTokenDecodedRaw);

    if (Date.now() / 1000 < apolloTokenDecoded.exp) {
      return redirect('/');
    }
  }
};

export default guest;
