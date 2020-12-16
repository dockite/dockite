import { defineComponent, watchEffect } from 'vue';
import { onBeforeRouteUpdate, RouterView, useRouter } from 'vue-router';

import { SideMenu } from '../components/Common/SideMenu';

import { useAuth, usePortal } from '~/hooks';

type DashboardLayoutProps = never;

export const DashboardLayout = defineComponent<DashboardLayoutProps>(() => {
  const { getPortal } = usePortal();

  const router = useRouter();

  const { state } = useAuth();

  if (!state.authenticated) {
    router.push('/login');
  }

  watchEffect(() => {
    if (!state.authenticated) {
      router.push('/login');
    }
  });

  onBeforeRouteUpdate(() => {
    if (!state.authenticated) {
      router.push('/login');
    }
  });

  return () => (
    <el-container>
      <el-aside style="height: 100vh">
        <SideMenu />
      </el-aside>

      <el-container class="h-screen overflow-y-auto">
        <el-header class="shadow border-b-2 flex items-center justify-between">
          {getPortal('dockite-dashboard-header') || (
            <div>
              Welcome {state.user?.firstName} {state.user?.lastName}
            </div>
          )}
        </el-header>

        <el-main class="flex flex-col bg-gray-100">
          <div class="p-5 bg-white rounded-sm shadow">
            <RouterView />
          </div>
        </el-main>
      </el-container>
    </el-container>
  );
});

export default DashboardLayout;
