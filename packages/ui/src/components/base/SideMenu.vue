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
        <span slot="title"><a-icon type="database" /><span>Schemas</span></span>
        <a-menu-item v-for="schema in allSchemas" :key="`schema/${schema.name}`">
          <router-link :to="`/schema/${schema.name}`">
            {{ schema.name }}
          </router-link>
        </a-menu-item>
      </a-sub-menu>

      <a-sub-menu>
        <span slot="title"><a-icon type="team" /><span>Team</span></span>
        <a-menu-item>Team 1</a-menu-item>
        <a-menu-item>Team 2</a-menu-item>
      </a-sub-menu>

      <a-menu-item>
        <a-icon type="file" />
        <span>File</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { gql } from 'apollo-boost';

@Component({
  apollo: {
    allSchemas: gql`
      {
        allSchemas {
          name
        }
      }
    `,
  },
})
export class BaseSideMenu extends Vue {
  readonly allSchemas!: any; // eslint-disable-line

  collapsed = false;

  public openKeys: string[] = [];

  @Watch('allSchemas')
  handleChange() {
    console.log(this.allSchemas);
  }

  public calculateKeysFromRoute(): string[] {
    return this.$route.path
      .split('/')
      .filter(x => x !== '')
      .map((chunk, index, array) => {
        return array.slice(0, index + 1).join('/');
      });
  }

  @Watch('$route', { deep: true })
  handleRouteChange() {
    console.log('Route change');
    this.openKeys = this.calculateKeysFromRoute();
  }

  beforeMount() {
    this.openKeys = this.calculateKeysFromRoute();
  }
}

export default BaseSideMenu;
</script>

<style lang="scss" scoped>
.ant-menu-inline a {
  display: inline-block;
}
</style>
