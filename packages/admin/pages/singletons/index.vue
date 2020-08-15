<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>All Singletons</h2>
        <el-dropdown>
          <el-button size="medium">
            Actions
            <i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="$can('internal:schema:create')">
              <router-link :to="`/singletons/import`">
                <i class="el-icon-upload2" />
                Import Singleton
              </router-link>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="all-documents-page el-loading-parent__min-height">
      <el-table :data="allSingletons.results" style="width: 100%">
        <el-table-column prop="id" label="ID" sortable>
          <template slot-scope="scope">
            <router-link :to="`/singletons/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="Singleton" sortable>
          <template slot-scope="scope">
            <router-link :to="`/singletons/${scope.row.id}`">
              {{ scope.row.title | shortDesc }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" sortable />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" sortable />
        <el-table-column label="Actions">
          <span slot-scope="scope" class="dockite-table--actions">
            <router-link title="Edit Singleton" :to="`/singletons/${scope.row.id}/edit`">
              <i class="el-icon-edit-outline" />
            </router-link>
            <router-link title="Delete Singleton" :to="`/singletons/${scope.row.id}/delete`">
              <i class="el-icon-delete" />
            </router-link>
            <router-link title="View Revisions" :to="`/singletons/${scope.row.id}/revisions`">
              <i class="el-icon-document-copy" />
            </router-link>
          </span>
        </el-table-column>
      </el-table>
      <el-pagination
        class="dockite-element--pagination"
        :current-page="currentPage"
        :page-count="totalPages"
        :pager-count="5"
        hide-on-single-page
        layout="prev, pager, next"
      />
    </div>
  </fragment>
</template>

<script lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ManyResultSet, AllSingletonsResultItem } from '../../common/types';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllSingletonsPage extends Vue {
  public loading = 0;

  get allSingletons(): ManyResultSet<AllSingletonsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSingletons;
  }

  get currentPage(): number {
    if (!this.allSingletons.currentPage) {
      return 1;
    }

    return this.allSingletons.currentPage;
  }

  get totalPages(): number {
    if (!this.allSingletons.totalPages) {
      return 1;
    }

    return this.allSingletons.totalPages;
  }

  public async fetchAllSingletons(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchAllSingletons`);
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching singletons, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  mounted(): void {
    this.fetchAllSingletons();
  }
}
</script>

<style lang="scss"></style>
