<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Schema - <strong>{{ schemaName }}</strong>
        </h2>

        <el-row type="flex" align="middle">
          <portal-target name="header-extra" style="margin-right: 1rem;" />

          <el-dropdown>
            <el-button size="medium">
              Actions
              <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/create`">
                  <i class="el-icon-document-add" />
                  Create
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/edit`">
                  <i class="el-icon-edit" />
                  Edit
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/bulk-edit`">
                  <i class="el-icon-magic-stick" />
                  Bulk Edit
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/delete`" style="color: rgb(245, 108, 108)">
                  <i class="el-icon-delete" />
                  Delete
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <router-link :to="`/schemas/${schemaId}/revisions`">
                  <i class="el-icon-document-copy" />
                  Revisions
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/import`">
                  <i class="el-icon-upload2" />
                  Import Schema
                </router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-row>
      </el-row>
    </portal>

    <portal to="opposite-breadcrumb">
      <el-select v-model="currentView" size="medium">
        <el-option
          v-for="view in availableViews"
          :key="view"
          :label="startCase(view)"
          :value="view"
        />
      </el-select>
    </portal>

    <div class="all-schema-documents-page">
      <component :is="currentView" />
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { startCase } from 'lodash';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import FilterInput from '~/components/base/filter-input.vue';
import TableView from '~/components/schemas/views/table-view.vue';
import TreeView from '~/components/schemas/views/tree-view.vue';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
    FilterInput,
    TableView,
    TreeView,
  },
})
export default class SchemaDocumentsPage extends Vue {
  public currentView = 'table-view';

  public startCase = startCase;

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get availableViews(): string[] {
    const views = ['table-view'];

    if (this.schema && this.schema.settings.enableTreeView) {
      views.push('tree-view');
    }

    return views;
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  padding: 1rem;
}
</style>
