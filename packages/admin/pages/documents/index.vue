<template>
  <fragment>
    <portal to="header">
      <h2>All Documents</h2>
    </portal>

    <div class="all-documents-page">
      <el-table :data="allDocumentsWithSchema.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/documents/${scope.row.id}`">
              {{ scope.row.id.slice(0, 8) + '...' }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Identifier">
          <template slot-scope="scope">
            <span v-if="scope.row.data.name">
              {{ scope.row.data.name }}
            </span>
            <span v-else-if="scope.row.data.title">
              {{ scope.row.data.title }}
            </span>
            <span v-else-if="scope.row.data.identifier">
              {{ scope.row.data.identifier }}
            </span>
            <span v-else :title="scope.row.data">
              {{ JSON.stringify(scope.row.data).substr(0, 15) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="schema.name" label="Schema">
          <template slot-scope="scope">
            <router-link :to="`/schema/${scope.row.schema.name}`">
              {{ scope.row.schema.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />
        <el-table-column label="Actions">
          <template slot-scope="scope">
            <router-link :to="`/documents/${scope.row.id}`" style="padding-right: 0.75rem;">
              <i class="el-icon-edit-outline" />
            </router-link>
            <router-link :to="`/documents/${scope.row.id}/delete`">
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

import { ManyResultSet, AllDocumentsWithSchemaResultItem } from '../../common/types';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllDocumentsPage extends Vue {
  get allDocumentsWithSchema(): ManyResultSet<AllDocumentsWithSchemaResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allDocumentsWithSchema;
  }

  get currentPage(): number {
    if (!this.allDocumentsWithSchema.currentPage) {
      return 1;
    }

    return this.allDocumentsWithSchema.currentPage;
  }

  get totalPages(): number {
    if (!this.allDocumentsWithSchema.totalPages) {
      return 1;
    }

    return this.allDocumentsWithSchema.totalPages;
  }

  public fetchAllDocumentsWithSchema(): void {
    this.$store.dispatch(`${data.namespace}/fetchAllDocumentsWithSchema`);
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  mounted(): void {
    this.fetchAllDocumentsWithSchema();
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
