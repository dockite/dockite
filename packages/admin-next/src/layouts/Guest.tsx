import { defineComponent, watch, watchEffect } from 'vue';
import { RouterView, onBeforeRouteUpdate, useRouter } from 'vue-router';

import { useAuth } from '~/hooks';

type GuestLayoutProps = never;

export const GuestLayout = defineComponent<GuestLayoutProps>(() => {
  const { state } = useAuth();

  const router = useRouter();

  // Handle authentication during the setup of the component
  if (state.authenticated) {
    router.push('/');
  }

  watchEffect(() => {
    if (state.authenticated) {
      router.push('/');
    }
  });

  // Also register a route handler to check for further authentication changes
  onBeforeRouteUpdate((_to, _from, next) => {
    if (state.authenticated) {
      router.push('/');
    }

    next();
  });

  return () => <RouterView />;
});

export default GuestLayout;
