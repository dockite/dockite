<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>All Schemas</h2>
        <el-dropdown>
          <el-button size="medium">
            Actions
            <i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="$can('internal:schema:create')">
              <router-link :to="`/schemas/import`">
                <i class="el-icon-upload2" />
                Import Schema
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="all-schemas-page el-loading-parent__min-height">
      <el-table :data="allSchemas.results" style="width: 100%">
        <el-table-column prop="id" label="ID" sortable>
          <template slot-scope="scope">
            <router-link :to="`/schemas/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Schema" sortable>
          <template slot-scope="scope">
            <router-link :to="`/schemas/${scope.row.id}`">
              {{ scope.row.title | shortDesc }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" sortable />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" sortable />
        <el-table-column label="Actions">
          <span slot-scope="scope" class="dockite-table--actions">
            <router-link
              v-if="$can('internal:schema:update')"
              title="Edit Schema"
              :to="`/schemas/${scope.row.id}/edit`"
            >
              <i class="el-icon-edit-outline" />
            </router-link>
            <router-link
              v-if="$can('internal:schema:delete')"
              title="Delete Schema"
              :to="`/schemas/${scope.row.id}/delete`"
            >
              <i class="el-icon-delete" />
            </router-link>
            <router-link title="View Revisions" :to="`/schemas/${scope.row.id}/revisions`">
              <i class="el-icon-folder-opened" />
            </router-link>
          </span>
        </el-table-column>
      </el-table>
      <el-pagination
        class="dockite-element--pagination"
        :current-page="currentPage"
        :page-count="totalPages"
        :pager-count="5"
        layout="prev, pager, next"
      />
    </div>
  </fragment>
</template>

<script lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllSchemasResultItem } from '../../common/types';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllSchemasPage extends Vue {
  public loading = 0;

  get allSchemas(): ManyResultSet<AllSchemasResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSchemas;
  }

  get currentPage(): number {
    if (!this.allSchemas.currentPage) {
      return 1;
    }

    return this.allSchemas.currentPage;
  }

  get totalPages(): number {
    if (!this.allSchemas.totalPages) {
      return 1;
    }

    return this.allSchemas.totalPages;
  }

  public async fetchAllSchemas(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllSchemas`);
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching schemas, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  mounted(): void {
    this.fetchAllSchemas();
  }
}
</script>

<style lang="scss">
.all-schemas-page {
  width: 100%;
}
</style>
