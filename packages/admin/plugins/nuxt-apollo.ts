import { Plugin } from '@nuxt/types';

const plugin: Plugin = (context, inject) => {
  const client = context.app.apolloProvider.defaultClient;

  inject('apolloClient', client);
  inject('apolloHelpers', context.app.$apolloHelpers);
};

export default plugin;
