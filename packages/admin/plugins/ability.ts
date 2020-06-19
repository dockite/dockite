import * as ability from '@dockite/ability';
import { Plugin } from '@nuxt/types';

declare module 'vuex/types/index' {
  interface Store<S> {
    $ability: typeof ability;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $ability: typeof ability;
  }
}

const plugin: Plugin = (_, inject) => {
  inject('ability', ability);
};

export default plugin;
