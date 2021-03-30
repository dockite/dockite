import jwtDecode from 'jwt-decode';
import { computed, defineComponent } from 'vue';
import { usePromise } from 'vue-composable';
import { onBeforeRouteLeave, RouterView } from 'vue-router';

import { RouterViewScopedSlot } from './common/types';
import { LoadingComponent } from './components/Common/Loading';
import { LayoutManager } from './layouts/LayoutManager';

import { useAuth } from '~/hooks/useAuth';

const handleRefreshSession = async (): Promise<void> => {
  const { state, handleRefreshToken, token } = useAuth();

  if (!token.value) {
    state.authenticated = false;
  } else {
    const claims = jwtDecode<{ exp: number }>(token.value);

    const now = Date.now() / 1000;

    if (claims && now > claims.exp) {
      console.info('expired session, handling refresh');

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
    const { state, handleRefreshUser } = useAuth();

    const refreshSession = usePromise(async () => {
      await handleRefreshSession();

      if (state.authenticated && !state.user) {
        await handleRefreshUser();
      }
    });

    const loading = computed(() => refreshSession.loading.value || !state.initialised);

    onBeforeRouteLeave((_to, _from, next) => {
      refreshSession.exec().then(next);
    });

    return () => {
      if (loading.value) {
        return <LoadingComponent />;
      }

      return (
        <RouterView>
          {{
            default: ({ route, Component }: RouterViewScopedSlot) => (
              <LayoutManager route={route} Component={Component} />
            ),
          }}
        </RouterView>
      );
    };
  },
});

export default App;
