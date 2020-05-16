import { ApolloClient } from 'apollo-client';
import { ApolloHelpers } from '@nuxtjs/apollo';

declare module 'vuex/types/index' {
  interface Store<S> {
    $apolloClient: ApolloClient<any>;
    $apolloHelpers: ApolloHelpers;
  }
}
