import jwtDecode from 'jwt-decode';
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  reactive,
  ref,
  Teleport,
  watch,
  watchEffect,
} from 'vue';
import { usePromise } from 'vue-composable';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import { useConfig } from './hooks';

import { useAuth } from '~/hooks/useAuth';

type AppProps = never;

const tokenRefresh = async (): Promise<void> => {
  const { state, handleRefreshToken, token } = useAuth();

  if (!token.value) {
    state.authenticated = false;
  } else {
    const claims = jwtDecode<{ exp: number }>(token.value);

    const now = Date.now() / 1000;

    if (claims && now > claims.exp) {
      await handleRefreshToken();
    }
  }
};

const Layout = reactive({
  Component: defineAsyncComponent({
    loader: () => import(`./layouts/Default`),
  }),
});

/**
 * Setup the Application with the routes registered layout default to "Default"
 * if it hasn't been set.
 */
export const App = defineComponent<AppProps>(() => {
  const config = useConfig();

  const route = useRoute();

  const { state, handleRefreshUser } = useAuth();

  const meta = computed(() => {
    return route.meta;
  });

  const { loading } = usePromise(() =>
    tokenRefresh().then(() => {
      if (state.authenticated) {
        return handleRefreshUser();
      }

      return Promise.resolve(null);
    }),
  );

  // Derrive the layout value from the current routes meta info
  const layout = ref('Default');

  onBeforeRouteLeave((to, _from, next) => {
    if (to.meta && to.meta.layout) {
      layout.value = to.meta.layout;
    }

    next();
  });

  onBeforeRouteLeave(tokenRefresh);

  watchEffect(() => {
    if (meta.value.layout) {
      layout.value = meta.value.layout;
    }
  });

  watch(layout, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      Layout.Component = defineAsyncComponent({
        loader: () => import(`./layouts/${layout.value ?? 'Default'}`),
      });
    }
  });

  return () => {
    if (loading.value) {
      return (
        <>
          <Teleport to="head">
            <title>{config.app.title} | Loading...</title>
          </Teleport>

          <div>Loading...</div>
        </>
      );
    }

    return (
      <>
        <Teleport to="head">
          <title>{config.app.title}</title>
        </Teleport>

        <Layout.Component />
      </>
    );
  };
});

export default App;
