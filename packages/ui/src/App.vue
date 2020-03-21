<template>
  <a-layout id="components-layout-demo-side" style="min-height: 100vh">
    <base-side-menu />
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 16px;">
        <h1>{{ title || 'Hullo' }}</h1>
      </a-layout-header>
      <a-layout-content style="margin: 0 16px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.name">
            <span v-if="$route.path === crumb.path">
              {{ crumb.name | startCase }}
            </span>
            <router-link v-else :to="crumb.path">
              {{ crumb.name | startCase }}
            </router-link>
          </a-breadcrumb-item>
        </a-breadcrumb>
        <main class="dockite-view">
          <router-view />
        </main>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Dockite | Made with ❤
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { startCase } from 'lodash';

import BaseSideMenu from './components/base/SideMenu.vue';
import BaseRouterView from './components/base/RouterView.vue';

@Component({
  components: {
    BaseSideMenu,
    BaseRouterView,
  },

  filters: {
    startCase(value: string) {
      const re = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

      if (re.test(value)) {
        return value;
      }
      return startCase(value);
    },
  },
})
export class App extends Vue {
  get breadcrumbs() {
    const crumbs = this.$route.path
      .split('/')
      .filter(x => x !== '')
      .map((name, index, array) => ({
        name,
        path: `/${array.slice(0, index + 1).join('/')}`,
      }));

    crumbs.unshift({ name: 'Home', path: '/' });

    return crumbs;
  }
}

export default App;
</script>

<style lang="scss">
@import '~ant-design-vue/dist/antd.css';

.dockite-view {
  background: #ffffff;
}
</style>
