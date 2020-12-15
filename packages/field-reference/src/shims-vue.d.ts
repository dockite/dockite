import Vue, { Component } from 'vue';
import { ApolloClient } from 'apollo-client';

declare module '*.vue' {
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloClient: ApolloClient<any>;
    $dockiteFieldManager: Record<
      string,
      {
        input: Component;
        settings: Component;
        view?: Component | null;
      }
    >;
    $message: (input: { message: string; type: string }) => void;
  }
}
