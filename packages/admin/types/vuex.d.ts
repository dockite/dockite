import { ApolloHelpers } from '@nuxtjs/apollo';
import { ApolloClient } from 'apollo-client';

import { DockiteFieldManager } from '~/plugins/dockite';

declare module 'vuex/types/index' {
  interface Store<S> {
    $apolloClient: ApolloClient<any>;
    $apolloHelpers: ApolloHelpers;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloClient: ApolloClient<any>;
    $dockiteFieldManager: DockiteFieldManager;
  }
}
