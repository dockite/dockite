import { defineComponent, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

import { useAuth } from '~/hooks';

export const GuestLayout = defineComponent({
  name: 'GuestLayoutComponent',

  setup: (_, ctx) => {
    const { state } = useAuth();

    const router = useRouter();

    const route = useRoute();

    watch(
      state,
      () => {
        // Handle authentication during the setup of the component
        if (state.authenticated) {
          if (route.query.redirectTo && typeof route.query.redirectTo === 'string') {
            router.push(decodeURIComponent(route.query.redirectTo));
          } else {
            router.push('/');
          }
        }
      },
      { immediate: true },
    );

    // Also register a route handler to check for further authentication changes
    onBeforeRouteUpdate((_to, _from, next) => {
      if (state.authenticated) {
        if (route.query.redirectTo && typeof route.query.redirectTo === 'string') {
          router.push(decodeURIComponent(route.query.redirectTo));
        } else {
          router.push('/');
        }
      }

      next();
    });

    return () => <div>{ctx.slots.default && ctx.slots.default()}</div>;
  },
});

export default GuestLayout;
