import jwtDecode from 'jwt-decode';
import {
  Component,
  computed,
  defineAsyncComponent,
  defineComponent,
  onBeforeMount,
  reactive,
  ref,
  Teleport,
  toRaw,
  watch,
  watchEffect,
} from 'vue';
import { usePromise } from 'vue-composable';
import { NavigationGuard, onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from 'vue-router';

import Logo from './components/Common/Logo';
import { useConfig } from './hooks';

import { useAuth } from '~/hooks/useAuth';
import { DefaultLayout } from '~/layouts/Default';

const handleRefreshSession = async (): Promise<void> => {
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

/**
 * Setup the Application with the routes registered layout default to "Default"
 * if it hasn't been set.
 */
export const App = defineComponent({
  name: 'AppComponent',

  setup: () => {
    const config = useConfig();

    const route = useRoute();

    const { state, handleRefreshUser } = useAuth();

    const hasResolvedInitialLayout = ref(false);

    const Layout = reactive({
      name: 'Default',
      loading: false,
      Component: DefaultLayout,
    });

    const meta = computed(() => route.meta);

    const refreshSession = usePromise(async () => {
      await handleRefreshSession();

      if (state.authenticated && !state.user) {
        await handleRefreshUser();
      }
    });

    const loading = computed(
      () =>
        Layout.loading ||
        refreshSession.loading.value ||
        !hasResolvedInitialLayout.value ||
        !state.initialised,
    );

    const handleUpdateLayout = async (layout: string): Promise<void> => {
      let component: any | null = null;

      Layout.loading = true;

      switch (layout) {
        case 'Guest':
          component = await import('./layouts/Guest').then(mod => mod.GuestLayout);
          break;

        case 'Dashboard':
          component = await import('./layouts/Dashboard').then(mod => mod.DashboardLayout);
          break;

        default:
          component = DefaultLayout;
          break;
      }

      if (component !== null) {
        Layout.name = layout;
        Layout.Component = component;
      }

      if (!hasResolvedInitialLayout.value) {
        hasResolvedInitialLayout.value = true;
      }

      Layout.loading = false;
    };

    const guard: NavigationGuard = (to, _from, next) => {
      if (!to.meta || !to.meta.layout) {
        next();
      }

      if (to.meta.layout === Layout.name) {
        next();
      }

      if (to.meta.layout !== Layout.name) {
        handleUpdateLayout(to.meta.layout).then(next);
      }
    };

    onBeforeRouteLeave(guard);

    onBeforeRouteUpdate(guard);

    onBeforeRouteLeave((_to, _from, next) => {
      refreshSession.exec().then(next);
    });

    watch(meta, value => {
      if (value && value.layout) {
        if (value.layout !== Layout.name) {
          handleUpdateLayout(value.layout);
        }
      }
    });

    return () => {
      if (loading.value) {
        return (
          <>
            <Teleport to="head">
              <title>{config.app.title} | Loading...</title>
            </Teleport>

            <div class="w-screen h-screen flex flex-col items-center justify-center">
              <div class="mb-5 animate-groovy" style={{ width: '400px', height: '100px' }}>
                <Logo class="block" style={{ maxWidth: '400px', maxHeight: '100px' }} />
              </div>

              <span>We're getting everything ready, please wait...</span>
            </div>
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
  },
});

export default App;
