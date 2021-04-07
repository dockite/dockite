import { ApolloClient } from '@apollo/client/core';
import Vue from 'vue';

declare module '*.vue' {
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloClient: ApolloClient<any>;
    $message: (input: { message: string; type: string }) => void;
  }
}
