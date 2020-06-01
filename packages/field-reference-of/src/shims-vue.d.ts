import Vue from 'vue';
import VueRouter, { Route } from 'vue-router';
import { ApolloClient } from 'apollo-client';

declare module '*.vue' {
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloClient: ApolloClient<any>
    $router: VueRouter
  }
}
