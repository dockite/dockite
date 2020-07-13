<template>
  <el-container>
    <el-aside width="auto">
      <side-menu class="dockite-aside--sidemenu" />
    </el-aside>
    <el-container>
      <el-header class="dockite-main--header" height="">
        <portal-target name="header" style="width: 100%">
          <h2>Portal <strong>header</strong> not used</h2>
        </portal-target>
      </el-header>
      <el-main>
        <el-row type="flex" justify="space-between" align="middle" style="padding-bottom: 1rem;">
          <el-breadcrumb class="">
            <el-breadcrumb-item to="/">
              <i class="el-icon-s-home" />
            </el-breadcrumb-item>
            <el-breadcrumb-item
              v-for="crumb in breadcrumbs"
              :key="crumb.location"
              :to="crumb.location"
            >
              {{ crumb.title | startCaseUnlessUUID }}
            </el-breadcrumb-item>
          </el-breadcrumb>

          <portal-target name="opposite-breadcrumb" />
        </el-row>
        <transition name="el-fade-in-linear">
          <nuxt />
        </transition>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { startCase } from 'lodash';
import { Component, Vue } from 'nuxt-property-decorator';

import SideMenu from '~/components/base/side-menu.vue';

interface BreadcrumbItem {
  title: string;
  location: string;
}

@Component({
  middleware: 'authenticated',
  components: {
    SideMenu,
  },
  filters: {
    startCaseUnlessUUID(value: string) {
      if (value.split('-').length >= 3) {
        return value;
      }

      return startCase(value);
    },
  },
})
export default class DefaultLayout extends Vue {
  get breadcrumbs(): BreadcrumbItem[] {
    return this.$route.path
      .split('/')
      .filter(x => x !== '')
      .map((title, index, array) => ({
        title,
        location: `/${array.slice(0, index + 1).join('/')}`,
      }));
  }
}
</script>

<style lang="scss">
.dockite-aside--sidemenu {
  height: 100vh;
  overflow-y: auto;
}

.dockite-main--header {
  height: 80px;
  display: flex;
  align-items: center;
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    line-height: 1;
  }
}

.dockite-main--breadcrumb {
  padding-bottom: 2rem;
  width: 100%;
}
</style>
