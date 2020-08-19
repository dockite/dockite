<template>
  <div>
    <el-menu
      class="dockite-aside--el-menu dockite-aside--fixed fixed overflow-y-auto"
      :collapse="isCollapse"
      :background-color="backgroundColor"
      :text-color="textColor"
      :active-text-color="activeTextColor"
    >
      <div v-show="!isCollapse" style="height: 50px; padding: 1rem 1rem 0.5rem 1rem; ">
        <logo fill-color="transparent" height="100%" />
      </div>
      <el-menu-item index="/">
        <router-link slot="title" style="color: inherit" class="block" to="/">
          <i class="el-icon-s-home"></i>
          <span>{{ $t('sideMenu.home') }}</span>
        </router-link>
      </el-menu-item>

      <el-menu-item v-if="$can('internal:schema:read')" index="/documents">
        <router-link slot="title" style="color: inherit" class="block" to="/documents">
          <i class="el-icon-document"></i>
          <span>{{ $t('sideMenu.documents') }}s</span>
        </router-link>
      </el-menu-item>

      <el-submenu v-else index="/documents">
        <template slot="title">
          <i class="el-icon-document"></i>
          <span slot="title">{{ $t('sideMenu.documents') }}s</span>
        </template>

        <el-menu-item index="/documents">
          <router-link slot="title" to="/documents" class="block" style="color: inherit">
            <span>All {{ $t('sideMenu.documents') }}s</span>
          </router-link>
        </el-menu-item>

        <el-menu-item-group
          v-if="allSchemas && allSchemas.results && allSchemas.results.length > 0"
          title="Schema Documents"
        >
          <el-menu-item
            v-for="schema in allSchemas.results"
            :key="schema.id"
            :index="`/schemas/${schema.id}`"
          >
            <router-link
              slot="title"
              style="color: inherit"
              class="block"
              :to="`/schemas/${schema.id}`"
            >
              <span>{{ schema.title }}</span>
            </router-link>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>

      <el-submenu v-if="$can('internal:schema:read')" index="/schemas">
        <template slot="title">
          <i class="el-icon-s-grid"></i>
          <span slot="title">{{ $t('sideMenu.schemas') }}s</span>
        </template>

        <el-menu-item-group title="Management">
          <el-menu-item index="/schemas">
            <router-link slot="title" style="color: inherit" class="block" to="/schemas">
              <span>All {{ $t('sideMenu.schemas') }}s</span>
            </router-link>
          </el-menu-item>

          <el-menu-item index="/schemas/create">
            <router-link slot="title" style="color: inherit" class="block" to="/schemas/create">
              <span>Create {{ $t('sideMenu.schemas') }}</span>
            </router-link>
          </el-menu-item>
        </el-menu-item-group>
        <el-menu-item-group v-if="allSchemas" :title="$t('sideMenu.schemas') + 's'">
          <el-menu-item
            v-for="schema in allSchemas.results"
            :key="schema.id"
            :index="`/schemas/${schema.id}`"
          >
            <router-link
              slot="title"
              style="color: inherit"
              class="block"
              :to="`/schemas/${schema.id}`"
            >
              <span>{{ schema.title }}</span>
            </router-link>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>

      <el-submenu
        v-if="$can('internal:singleton:read') || $can('internal:singleton:create')"
        index="/singletons"
      >
        <template slot="title">
          <i class="el-icon-notebook-2"></i>
          <span slot="title">{{ $t('sideMenu.singletons') }}s</span>
        </template>

        <el-menu-item-group v-if="$can('internal:singleton:read')" title="Management">
          <el-menu-item index="/singletons">
            <router-link slot="title" style="color: inherit" class="block" to="/singletons">
              <span>All {{ $t('sideMenu.singletons') }}s</span>
            </router-link>
          </el-menu-item>

          <el-menu-item v-if="$can('internal:singleton:create')" index="/singletons/create">
            <router-link slot="title" style="color: inherit" class="block" to="/singletons/create">
              <span>Create {{ $t('sideMenu.singletons') }}</span>
            </router-link>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group
          v-if="allSingletons && allSingletons.results && allSingletons.results.length > 0"
          :title="$t('sideMenu.singletons') + 's'"
        >
          <el-menu-item
            v-for="schema in allSingletons.results"
            :key="schema.id"
            :index="`/singletons/${schema.id}`"
          >
            <router-link
              slot="title"
              style="color: inherit"
              class="block"
              :to="`/singletons/${schema.id}`"
            >
              <span>{{ schema.title }}</span>
            </router-link>
          </el-menu-item>
        </el-menu-item-group>

        <span v-else>
          <el-menu-item>
            <i class="el-icon-warning"></i>
            No {{ $t('sideMenu.singletons') }}s
          </el-menu-item>
        </span>
      </el-submenu>

      <!-- <el-submenu index="/releases">
        <template slot="title">
          <i class="el-icon-date"></i>
          <span slot="title">Releases (Coming Soon)</span>
        </template>
      </el-submenu> -->

      <el-submenu
        v-if="
          $can('internal:users:read') ||
            $can('internal:roles:read') ||
            $can('internal:webhooks:read')
        "
        index="/settings"
      >
        <template slot="title">
          <i class="el-icon-setting"></i>
          <span slot="title">Settings</span>
        </template>

        <el-menu-item v-if="$can('internal:users:read')" index="/settings/users">
          <router-link slot="title" style="color: inherit" class="block" to="/settings/users">
            <i class="el-icon-user"></i>
            <span>{{ $t('sideMenu.users') }}</span>
          </router-link>
        </el-menu-item>

        <el-menu-item v-if="$can('internal:roles:read')" index="/settings/roles">
          <router-link slot="title" style="color: inherit" class="block" to="/settings/roles">
            <i class="el-icon-lock"></i>
            <span>{{ $t('sideMenu.roles') }}</span>
          </router-link>
        </el-menu-item>

        <el-menu-item v-if="$can('internal:webhooks:read')" index="/settings/webhooks">
          <router-link slot="title" style="color: inherit" class="block" to="/settings/webhooks">
            <i class="el-icon-connection"></i>
            <span>{{ $t('sideMenu.webhooks') }}</span>
          </router-link>
        </el-menu-item>
      </el-submenu>

      <el-menu-item index="/account">
        <router-link slot="title" style="color: inherit" class="block" to="/account">
          <i class="el-icon-user"></i>
          <span>{{ $t('sideMenu.account') }}</span>
        </router-link>
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

.dockite-aside--fixed {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }
}

.dockite-aside--el-menu:not(.el-menu--collapse) {
  width: 100vw;
  max-width: 300px;
}

.el-menu-item-group__title {
  color: rgba(255, 255, 255, 0.8);
}
</style>
