<template>
  <div>
    <el-menu
      :router="true"
      class="dockite-aside--el-menu fixed"
      :collapse="isCollapse"
      :background-color="backgroundColor"
      :text-color="textColor"
      :active-text-color="activeTextColor"
    >
      <el-menu-item index="/">
        <i class="el-icon-s-home"></i>
        <span slot="title">{{ $t('sideMenu.home') }}</span>
      </el-menu-item>
      <el-menu-item index="/documents">
        <i class="el-icon-document"></i>
        <span slot="title">{{ $t('sideMenu.documents') }}</span>
      </el-menu-item>
      <el-submenu index="/schemas">
        <template slot="title">
          <i class="el-icon-s-grid"></i>
          <span slot="title">{{ $t('sideMenu.schemas') }}</span>
        </template>
        <el-menu-item-group title="Management">
          <el-menu-item index="/schemas">
            <span slot="title">All Schemas</span>
          </el-menu-item>
          <el-menu-item index="/schemas/create">
            <span slot="title">Create Schema</span>
          </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group v-if="allSchemas" title="Recent Schemas">
          <el-menu-item
            v-for="schema in allSchemas.results.slice(0, 5)"
            :key="schema.id"
            :index="`/schemas/${schema.id}`"
          >
            <span slot="title">{{ schema.title }}</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <el-submenu index="/releases">
        <template slot="title">
          <i class="el-icon-date"></i>
          <span slot="title">Releases (Coming Soon)</span>
        </template>
      </el-submenu>
      <el-submenu index="/settings">
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span slot="title">Settings</span>
        </template>

        <el-menu-item index="/settings/users">
          <i class="el-icon-user"></i>
          <span slot="title">{{ $t('sideMenu.users') }}</span>
        </el-menu-item>

        <el-menu-item index="/settings/roles">
          <i class="el-icon-lock"></i>
          <span slot="title">{{ $t('sideMenu.roles') }}</span>
        </el-menu-item>

        <el-menu-item index="/settings/webhooks">
          <i class="el-icon-connection"></i>
          <span slot="title">{{ $t('sideMenu.webhooks') }}</span>
        </el-menu-item>
      </el-submenu>
      <el-menu-item index="#logout" @click.native.prevent="logout">
        <i class="el-icon-refresh-left"></i>
        <span slot="title">Logout</span>
      </el-menu-item>
      <el-menu-item index="#collapse" @click.native.prevent="isCollapse = !isCollapse">
        <i :class="{ 'el-icon-d-arrow-left': !isCollapse, 'el-icon-d-arrow-right': isCollapse }" />
        <span slot="title">{{ isCollapse ? 'Expand' : 'Collapse' }}</span>
      </el-menu-item>
    </el-menu>

    <!-- This is a dummy menu so we can have a fixed menu with smooth animations -->
    <el-menu
      class="dockite-aside--el-menu"
      :collapse="isCollapse"
      style="visibility: 0; z-index: -9999"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { AllSchemasResultItem, ManyResultSet } from '../../common/types';

import { NAV_BACKGROUND_COLOR, NAV_ACTIVE_TEXT_COLOR, NAV_TEXT_COLOR } from '~/common/constants';
import { namespace } from '~/store/auth';
import * as data from '~/store/data';

@Component({
  components: { Fragment },
})
export default class SideMenuComponent extends Vue {
  public isCollapse = false;

  public backgroundColor = NAV_BACKGROUND_COLOR;

  public activeTextColor = NAV_ACTIVE_TEXT_COLOR;

  public textColor = NAV_TEXT_COLOR;

  get allSchemas(): ManyResultSet<AllSchemasResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSchemas;
  }

  async fetchAllSchemas(): Promise<void> {
    if (this.allSchemas.results.length === 0) {
      await this.$store.dispatch(`${data.namespace}/fetchAllSchemas`);
    }
  }

  mounted(): void {
    this.fetchAllSchemas();
  }

  public async logout(): Promise<void> {
    await this.$store.dispatch(`${namespace}/logout`);

    this.$router.push('/login');
  }
}
</script>

<style lang="scss">
.dockite-aside--el-menu.fixed {
  position: fixed;
  height: 100%;
  top: 0;
  left: 0;
}
.dockite-aside--el-menu:not(.el-menu--collapse) {
  width: 100vw;
  max-width: 300px;
}

.el-menu-item-group__title {
  color: rgba(255, 255, 255, 0.8);
}
</style>
