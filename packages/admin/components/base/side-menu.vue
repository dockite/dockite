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
      <div v-show="!isCollapse" style="height: 50px; padding: 1rem 1rem 0.5rem 1rem; ">
        <logo fill-color="transparent" height="100%" />
      </div>
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
      <el-submenu index="/singletons">
        <template slot="title">
          <i class="el-icon-notebook-2"></i>
          <span slot="title">{{ $t('sideMenu.singletons') }}</span>
        </template>
        <el-menu-item-group title="Management">
          <el-menu-item index="/singletons">
            <span slot="title">All Singletons</span>
          </el-menu-item>
          <el-menu-item index="/singletons/create">
            <span slot="title">Create Singleton</span>
          </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group v-if="allSingletons" title="Recent Singletons">
          <el-menu-item
            v-for="schema in allSingletons.results.slice(0, 5)"
            :key="schema.id"
            :index="`/singletons/${schema.id}`"
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
      <el-menu-item index="/account">
        <i class="el-icon-user"></i>
        <span slot="title">{{ $t('sideMenu.account') }}</span>
      </el-menu-item>
      <el-menu-item index="#logout" @click.native.prevent="logout">
        <i class="el-icon-refresh-left"></i>
        <span slot="title">Logout</span>
      </el-menu-item>
      <el-menu-item @click.native.prevent="isCollapse = !isCollapse">
        <i :class="{ 'el-icon-d-arrow-left': !isCollapse, 'el-icon-d-arrow-right': isCollapse }" />
        <!-- <span slot="title">{{ isCollapse ? 'Expand' : 'Collapse' }}</span> -->
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

import { AllSchemasResultItem, ManyResultSet, AllSingletonsResultItem } from '../../common/types';

import { NAV_BACKGROUND_COLOR, NAV_ACTIVE_TEXT_COLOR, NAV_TEXT_COLOR } from '~/common/constants';
import LogoThumbnail from '~/components/base/logo-thumbnail.vue';
import Logo from '~/components/base/logo.vue';
import { namespace } from '~/store/auth';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
    Logo,
    LogoThumbnail,
  },
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

  get allSingletons(): ManyResultSet<AllSingletonsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSingletons;
  }

  async fetchAllSchemas(): Promise<void> {
    if (this.allSchemas.results.length === 0) {
      await this.$store.dispatch(`${data.namespace}/fetchAllSchemas`);
    }
  }

  async fetchAllSingletons(): Promise<void> {
    if (this.allSingletons.results.length === 0) {
      await this.$store.dispatch(`${data.namespace}/fetchAllSingletons`);
    }
  }

  mounted(): void {
    this.fetchAllSchemas();
    this.fetchAllSingletons();
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
