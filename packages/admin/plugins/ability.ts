import * as ability from '@dockite/ability';
import { Plugin } from '@nuxt/types';

declare module 'vuex/types/index' {
  interface Store<S> {
    $ability: typeof ability;
    $can: (...possibleScopes: string[]) => boolean;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $ability: typeof ability;
    $can: (...possibleScopes: string[]) => boolean;
  }
}

const plugin: Plugin = (ctx, inject) => {
  inject('ability', ability);

  inject('can', (...possibleScopes: string[]): boolean => {
    const scopes = ctx.store.state.auth?.user?.normalizedScopes ?? [];

    const [firstScope, ...remainingScopes] = possibleScopes;

    return ability.can(scopes, firstScope, ...remainingScopes);
  });
};

export default plugin;
