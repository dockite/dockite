import { defineComponent, watchEffect } from 'vue';

import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { useAuth, usePortal } from '~/hooks';

export const HomePage = defineComponent({
  name: 'HomePageComponent',

  setup: () => {
    const { setPortal } = usePortal();

    const { state: authState } = useAuth();

    if (authState.user) {
      setPortal(
        DASHBOARD_HEADER_PORTAL_TITLE,
        <div>
          Welcome back {authState.user.firstName} {authState.user.lastName}
        </div>,
      );
    }

    watchEffect(() => {
      if (authState.user) {
        setPortal(
          DASHBOARD_HEADER_PORTAL_TITLE,
          <div>
            Welcome back {authState.user.firstName} {authState.user.lastName}
          </div>,
        );
      }
    });

    return () => (
      <div>
        <h1 class="pb-3 text-2xl">Home Page content coming soon</h1>
        <router-link to="/login">Login</router-link>
      </div>
    );
  },
});

export default HomePage;
