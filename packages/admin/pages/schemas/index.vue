<template>
  <fragment>
    <portal to="header">
      <h2>All Schemas</h2>
    </portal>

    <div class="all-documents-page">
      <el-table :data="allSchemas.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/schemas/${scope.row.id}`">
              {{ scope.row.id.slice(0, 8) + '...' }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Schema">
          <template slot-scope="scope">
            <router-link :to="`/schemas/${scope.row.id}`">
              {{ scope.row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />
        <el-table-column label="Actions">
          <template slot-scope="scope">
            <router-link :to="`/schemas/${scope.row.id}/edit`" style="padding-right: 0.75rem;">
              <i class="el-icon-edit-outline" />
            </router-link>
            <router-link :to="`/schemas/${scope.row.id}/delete`">
              <i class="el-icon-delete" />
            </router-link>
          </template>
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

import { ManyResultSet, AllSchemasResultItem } from '../../common/types';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllSchemasPage extends Vue {
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

  public fetchAllSchemas(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllSchemas`);
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
.dockite-element--pagination {
  /* background: #ffffff; */
  background: transparent;

  li {
    background: transparent;
  }

  button {
    background: transparent;
  }
}
</style>
