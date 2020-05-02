<template>
  <a-layout-sider v-model="collapsed" class="side-menu" collapsible>
    <div class="logo" />
    <a-menu theme="dark" mode="inline" :open-keys.sync="openKeys" :selected-keys.sync="openKeys">
      <a-menu-item key="home">
        <a-icon type="home" />
        <router-link to="/">
          Home
        </router-link>
      </a-menu-item>

      <a-menu-item key="documents">
        <a-icon type="file" />
        <router-link to="/documents">
          Documents
        </router-link>
      </a-menu-item>

      <a-sub-menu key="schema">
        <router-link slot="title" to="/schema">
          <a-icon type="database" />
          <span>
            Schemas
          </span>
        </router-link>
        <a-menu-item v-for="schema in allSchemas" :key="`schema/${schema.name}`">
          <router-link :to="`/schema/${schema.name}`">
            {{ schema.name }}
          </router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu key="settings">
        <span slot="title">
          <a-icon type="setting" />
          <span>
            Settings
          </span>
        </span>

        <a-menu-item :key="`settings/webhooks`">
          <router-link :to="`/settings/webhooks`">
            Webhooks
          </router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-menu-item @click="handleLogout">
        <a-icon type="logout" />
        <span>Logout</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script lang="ts">
import { Schema } from '@dockite/types';
import { gql } from 'apollo-boost';
import { Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  apollo: {
    allSchemas: {
      query: gql`
        {
          allSchemas {
            name
          }
        }
      `,
      // pollInterval: 30000,
    },
  },
})
export class BaseSideMenu extends Vue {
  readonly allSchemas: Pick<Schema, 'name'>[] = [];

  public collapsed = false;

  public openKeys: string[] = [];

  public calculateKeysFromRoute(): string[] {
    return this.$route.path
      .split('/')
      .filter(x => x !== '')
      .map((chunk, index, array) => {
        return array.slice(0, index + 1).join('/');
      });
  }

  public handleLogout(): void {
    this.$store.dispatch('account/logout');
  }

  @Watch('$route', { deep: true, immediate: true })
  handleRouteChange(): void {
    this.openKeys = this.calculateKeysFromRoute();
  }
}

export default BaseSideMenu;
</script>

<style lang="scss" scoped>
.ant-menu-inline a {
  display: inline-block;
}

.ant-menu-submenu-title {
  a {
    color: inherit;
  }
}
</style>
