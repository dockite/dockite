import { Plugin } from '@nuxt/types';

const plugin: Plugin = async context => {
  try {
    if (!context.store.state.initialized) {
      await context.store.dispatch('init');
    }
  } catch {}
};

export default plugin;
