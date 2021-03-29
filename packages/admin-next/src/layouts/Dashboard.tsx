import { PortalTarget } from 'portal-vue';
import { defineComponent, watch } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

import { SideMenu } from '../components/Common/SideMenu';

import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_PORTAL_FOOTER,
} from '~/common/constants';
import { useAuth, useState } from '~/hooks';

export const DashboardLayout = defineComponent({
  name: 'DashboardLayoutComponent',

  setup: (_, ctx) => {
    const router = useRouter();

    const route = useRoute();

    const { state: authState } = useAuth();

    const state = useState();

    watch(
      authState,
      () => {
        if (authState.initialised && !authState.authenticated) {
          router.push({
            path: '/login',
            query: { redirectTo: encodeURIComponent(route.fullPath) },
          });
        }
      },
      { immediate: true },
    );

    onBeforeRouteUpdate(() => {
      if (authState.initialised && !authState.authenticated) {
        router.push({ path: '/login', query: { redirectTo: encodeURIComponent(route.fullPath) } });
      }
    });

    return () => (
      <el-container key={state.locale?.id}>
        <el-aside style="height: 100vh">
          <SideMenu />
        </el-aside>

        <el-container class="h-screen overflow-y-auto">
          <el-header class="shadow border-b-2 flex items-center justify-between">
            <PortalTarget name={DASHBOARD_HEADER_PORTAL_TITLE}>
              <div>
                Welcome {authState.user?.firstName} {authState.user?.lastName}
              </div>
            </PortalTarget>

            <PortalTarget name={DASHBOARD_HEADER_PORTAL_ACTIONS} />
          </el-header>

          <el-main class="flex flex-col bg-gray-100">
            <div class="p-5 relative bg-white rounded-sm shadow">
              {ctx.slots.default && ctx.slots.default()}
            </div>

            <PortalTarget name={DASHBOARD_MAIN_PORTAL_FOOTER} />
          </el-main>
        </el-container>
      </el-container>
    );
  },
});

export default DashboardLayout;
