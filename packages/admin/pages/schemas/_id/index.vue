<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%;" type="flex" justify="space-between" align="middle">
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
              <el-dropdown-item
                v-if="$can('internal:document:create', `schema:${schema && schema.name}:create`)"
              >
                <router-link :to="`/schemas/${schemaId}/create`">
                  <i class="el-icon-document-add" />
                  Create Document
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="$can('internal:schema:update')">
                <router-link :to="`/schemas/${schemaId}/edit`">
                  <i class="el-icon-edit" />
                  Edit Schema
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/bulk-edit`">
                  <i class="el-icon-magic-stick" />
                  Bulk Edit Documents
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="$can('internal:schema:delete')">
                <router-link :to="`/schemas/${schemaId}/delete`" style="color: rgb(245, 108, 108);">
                  <i class="el-icon-delete" />
                  Delete Schema
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item
                v-if="$can('internal:schema:read', 'internal:schema:update')"
                divided
              >
                <router-link :to="`/schemas/${schemaId}/revisions`">
                  <i class="el-icon-folder-opened" />
                  Schema Revisions
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="$can('internal:schema:update')">
                <router-link :to="`/schemas/${schemaId}/import`">
                  <i class="el-icon-upload2" />
                  Import Schema
                </router-link>
              </el-dropdown-item>

              <el-dropdown-item>
                <router-link :to="`/schemas/${schemaId}/deleted`">
                  <i class="el-icon-delete" />
                  Deleted Documents
                </router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-row>
      </el-row>
    </portal>

    <portal to="opposite-breadcrumb">
      <el-select v-if="availableViews.length > 1" v-model="currentView" size="medium">
        <el-option
          v-for="view in availableViews"
          :key="view"
          :label="startCase(view)"
          :value="view"
        />
      </el-select>
    </portal>

    <div v-loading="!schema" class="all-schema-documents-page el-loading-parent__min-height">
      <template v-if="schema">
        <el-tabs v-if="currentView === 'table-view'" type="border-card">
          <el-tab-pane lazy class="bg-white border border-t-0 pt-3" label="Results">
            <component
              :is="currentView"
              :selected-items.sync="selectedItems"
              :show-selected-items="true"
              :selectable="true"
            />
          </el-tab-pane>
          <el-tab-pane
            lazy
            class="bg-white border border-t-0 pt-3"
            :label="`Selected (${selectedItems.length})`"
          >
            <selected-view :selected-items.sync="selectedItems" />
          </el-tab-pane>
        </el-tabs>

        <component :is="currentView" v-else />
      </template>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Schema, Document } from '@dockite/database';
import { startCase } from 'lodash';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import FilterInput from '~/components/base/filter-input.vue';
import SelectedView from '~/components/schemas/views/selected-view.vue';
import TableView from '~/components/schemas/views/table-view.vue';
import TreeView from '~/components/schemas/views/tree-view.vue';
import * as data from '~/store/data';
import * as ui from '~/store/ui';

@Component({
  components: {
    Fragment,
    FilterInput,
    TableView,
    TreeView,
    SelectedView,
  },
})
export default class SchemaDocumentsPage extends Vue {
  public currentView = 'table-view';

  public startCase = startCase;

  public selectedItems: Document[] = [];

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

  public async fetchSchema(): Promise<void> {
    try {
      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.$route.params.id,
      });
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst retrieving the schema, please try again later.',
        type: 'error',
      });
    }
  }

  @Watch('availableViews')
  public handleAvailableViewsChange(): void {
    if (!this.availableViews.includes(this.currentView)) {
      this.currentView = this.availableViews[0];
    }
  }

  @Watch('currentView')
  public handleViewChange(): void {
    if (this.$route.query['x-view'] !== this.currentView) {
      this.$router.replace({
        query: {
          ...this.$route.query,
          'x-view': this.currentView,
        },
      });
    }
  }

  @Watch('selectedItems')
  public handleSelectedItemsChange(newItems: Document[]): void {
    this.$store.commit(`${ui.namespace}/setItemsForBulkEdit`, {
      schemaId: this.schemaId,
      items: [...newItems],
    });
  }

  beforeMount(): void {
    const uiState = this.$store.state.ui as ui.UiState;

    if (this.$route.query['x-view']) {
      this.currentView = this.$route.query['x-view'] as string;
    }

    if (uiState.itemsForBulkEditSchemaId === this.schemaId && uiState.itemsForBulkEdit.length > 0) {
      this.selectedItems = (this.$store.state.ui as ui.UiState).itemsForBulkEdit;
    } else {
      this.$store.commit(`${ui.namespace}/clearItemsForBulkEdit`);
    }

    this.fetchSchema();
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  padding: 1rem;
}

.all-schema-documents-page {
  .el-tabs__header {
    margin: 0;
  }

  .el-tabs--border-card > .el-tabs__content {
    padding: 0;
  }
}
</style>
