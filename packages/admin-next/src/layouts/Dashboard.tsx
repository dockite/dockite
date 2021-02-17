import { defineComponent, watchEffect } from 'vue';
import { onBeforeRouteUpdate, RouterView, useRoute, useRouter } from 'vue-router';

import { SideMenu } from '../components/Common/SideMenu';

import { DASHBOARD_HEADER_PORTAL_ACTIONS, DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { useAuth, usePortal } from '~/hooks';

export const DashboardLayout = defineComponent({
  name: 'DashboardLayoutComponent',

  setup: () => {
    const { getPortal } = usePortal();

    const router = useRouter();

    const route = useRoute();

    const { state } = useAuth();

    if (!state.authenticated) {
      router.push({ path: '/login', query: { redirectTo: encodeURIComponent(route.fullPath) } });
    }

    watchEffect(() => {
      if (!state.authenticated) {
        router.push({ path: '/login', query: { redirectTo: encodeURIComponent(route.fullPath) } });
      }
    });

    onBeforeRouteUpdate(() => {
      if (!state.authenticated) {
        router.push({ path: '/login', query: { redirectTo: encodeURIComponent(route.fullPath) } });
      }
    });

    return () => (
      <el-container>
        <el-aside style="height: 100vh">
          <SideMenu />
        </el-aside>

        <el-container class="h-screen overflow-y-auto">
          <el-header class="shadow border-b-2 flex items-center justify-between">
            {getPortal(DASHBOARD_HEADER_PORTAL_TITLE) || (
              <div>
                Welcome {state.user?.firstName} {state.user?.lastName}
              </div>
            )}

            {getPortal(DASHBOARD_HEADER_PORTAL_ACTIONS)}
          </el-header>

          <el-main class="flex flex-col bg-gray-100">
            <div class="p-5 bg-white rounded-sm shadow">
              <RouterView />
            </div>
          </el-main>
        </el-container>
      </el-container>
    );
  },
});

export default DashboardLayout;
