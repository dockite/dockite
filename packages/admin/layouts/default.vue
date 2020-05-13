<template>
  <el-container>
    <el-aside>
      <side-menu class="dockite-aside--sidemenu" />
    </el-aside>
    <el-container>
      <el-main>
        <nuxt />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import SideMenu from '~/components/base/side-menu.vue';

@Component({
  components: {
    SideMenu
  }
})
export default class DefaultLayout extends Vue {}
</script>

<style lang="scss">
.dockite-aside--sidemenu {
  height: 100vh;
  overflow-y: auto;
}
</style>
