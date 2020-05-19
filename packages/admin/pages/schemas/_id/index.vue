<template>
  <fragment>
    <portal to="header">
      <h2>
        Schema - <strong>{{ schemaName }}</strong>
      </h2>
    </portal>

    <div class="all-documents-page">
      <el-table :data="findDocumentsBySchemaId.results" style="width: 100%">
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
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';
import { formatDistanceToNow } from 'date-fns';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class SchemaDocumentsPage extends Vue {
  get findDocumentsBySchemaId() {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.findDocumentsBySchemaId;
  }

  get schemaId(): string {
    return this.$route.params.id;
  }

  get schemaName(): string {
    return this.$store.getters[`${data.namespace}/getSchemaNameById`](this.schemaId);
  }

  get currentPage(): number {
    if (!this.findDocumentsBySchemaId.currentPage) {
      return 1;
    }

    return this.findDocumentsBySchemaId.currentPage;
  }

  get totalPages(): number {
    if (!this.findDocumentsBySchemaId.totalPages) {
      return 1;
    }

    return this.findDocumentsBySchemaId.totalPages;
  }

  public async fetchFindDocumentsBySchemaId() {
    await this.$store.dispatch(`${data.namespace}/fetchFindDocumentsBySchemaId`, this.schemaId);
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange() {
    this.fetchFindDocumentsBySchemaId();
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