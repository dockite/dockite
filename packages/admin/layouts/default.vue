<template>
  <el-container>
    <el-aside width="auto">
      <side-menu class="dockite-aside--sidemenu" />
    </el-aside>
    <el-container>
      <el-header class="dockite-main--header shadow" height="">
        <portal-target name="header" style="width: 100%">
          <h2>Portal <strong>header</strong> not used</h2>
        </portal-target>
      </el-header>
      <el-main>
        <el-row type="flex" justify="space-between" align="middle" style="padding-bottom: 1rem;">
          <portal-target name="breadcrumb">
            <el-breadcrumb>
              <el-breadcrumb-item>
                <router-link to="/" style="color: inherit">
                  <i class="el-icon-s-home" />
                </router-link>
              </el-breadcrumb-item>
              <el-breadcrumb-item v-for="crumb in breadcrumbs" :key="crumb.location">
                <router-link style="color: inherit" :to="crumb.location">
                  {{ crumb.title | startCaseUnlessUUID }}
                </router-link>
              </el-breadcrumb-item>
            </el-breadcrumb>
          </portal-target>

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
import { Schema } from '@dockite/database';
import { Component, Vue } from 'nuxt-property-decorator';

import SideMenu from '~/components/base/side-menu.vue';
import * as data from '~/store/data';

interface BreadcrumbItem {
  title: string;
  location: string;
}

@Component({
  middleware: ['authenticated', 'authorized'],
  components: {
    SideMenu,
  },
})
export default class DefaultLayout extends Vue {
  get breadcrumbs(): BreadcrumbItem[] {
    return this.$route.path
      .split('/')
      .filter(x => x !== '')
      .map((title, index, array) => {
        // This handles showing the schema in the breadcrumbs for documents without
        // breaking for further items.
        if (
          title.toLowerCase() === 'documents' &&
          array[index + 1] &&
          this.schemaForDocumentRoute
        ) {
          const schema = this.schemaForDocumentRoute;

          return {
            title: schema.title,
            location: `/${array
              .slice(0, index + 1)
              .join('/')
              .replace('documents', `schemas/${schema.id}`)}`,
          };
        }

        return {
          title,
          location: `/${array.slice(0, index + 1).join('/')}`,
        };
      });
  }

  get isCurrentlyDocumentRoute(): boolean {
    return /.*documents\/.+/i.test(this.$route.path);
  }

  get schemaForDocumentRoute(): Schema | null {
    if (this.isCurrentlyDocumentRoute) {
      const document = this.$store.getters[`${data.namespace}/getDocumentById`](
        this.$route.params.id,
      );

      if (document) {
        return (
          this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](document.schemaId) ||
          null
        );
      }
    }

    return null;
  }
}
</script>

<style lang="scss">
.dockite-aside--sidemenu {
  height: 100vh;
  overflow-y: auto;
}

.dockite-main--header {
  position: sticky;
  height: 80px;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  background: #ffffff;

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
