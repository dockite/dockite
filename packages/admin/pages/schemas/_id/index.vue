<template>
  <fragment>
    <portal to="header">
      <el-row style="width: 100%" type="flex" justify="space-between" align="middle">
        <h2>
          Schema - <strong>{{ schemaName }}</strong>
        </h2>

        <el-row type="flex" align="middle">
          <el-input
            v-model="term"
            size="medium"
            style="max-width: 250px; margin-right: 1rem;"
            placeholder="Search"
            suffix-icon="el-icon-search"
          />
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

    <div class="all-schema-documents-page">
      <el-table :data="findDocumentsBySchemaId.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/documents/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Identifier">
          <template slot-scope="scope">
            <span v-if="scope.row.data.name" :title="scope.row.data.name">
              {{ scope.row.data.name | shortDesc }}
            </span>
            <span v-else-if="scope.row.data.title" :title="scope.row.data.title">
              {{ scope.row.data.title | shortDesc }}
            </span>
            <span v-else-if="scope.row.data.identifier" :title="scope.row.data.identifier">
              {{ scope.row.data.identifier | shortDesc }}
            </span>
            <span v-else :title="JSON.stringify(scope.row.data)">
              {{ JSON.stringify(scope.row.data) | shortDesc }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" :formatter="cellValueFromNow" />
        <el-table-column prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />
        <el-table-column label="Actions">
          <span slot-scope="scope" class="dockite-table--actions">
            <router-link title="Edit Document" :to="`/documents/${scope.row.id}`">
              <i class="el-icon-edit-outline" />
            </router-link>
            <router-link title="Delete Document" :to="`/documents/${scope.row.id}/delete`">
              <i class="el-icon-delete" />
            </router-link>
            <router-link title="View Revisions" :to="`/documents/${scope.row.id}/revisions`">
              <i class="el-icon-document-copy" />
            </router-link>
          </span>
        </el-table-column>
      </el-table>

      <el-row type="flex" justify="space-between">
        <span />
        <el-pagination
          :current-page="currentPage"
          class="dockite-element--pagination"
          :page-count="totalPages"
          :pager-count="5"
          :page-size="20"
          :total="totalItems"
          hide-on-single-page
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </el-row>
    </div>
  </fragment>
</template>

<script lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import {
  ManyResultSet,
  FindDocumentResultItem,
  SearchDocumentsWithSchemaResultItem,
} from '../../../common/types';

import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class SchemaDocumentsPage extends Vue {
  public term = '';

  get findDocumentsBySchemaId(): ManyResultSet<
    FindDocumentResultItem | SearchDocumentsWithSchemaResultItem
  > {
    const state: data.DataState = this.$store.state[data.namespace];

    return this.term === '' ? state.findDocumentsBySchemaId : state.searchDocumentsWithSchema;
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

  get totalItems(): number {
    if (!this.findDocumentsBySchemaId.totalItems) {
      return 1;
    }

    return this.findDocumentsBySchemaId.totalItems;
  }

  public fetchFindDocumentsBySchemaId(page = 1): void {
    this.$store.dispatch(`${data.namespace}/fetchFindDocumentsBySchemaId`, {
      schemaId: this.schemaId,
      page,
    });
  }

  public fetchSearchDocumentsWithSchema(term: string, page = 1): void {
    this.$store.dispatch(`${data.namespace}/fetchSearchDocumentsWithSchema`, {
      term,
      page,
      schemaId: this.schemaId,
    });
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  public handlePageChange(newPage: number): void {
    if (this.term === '') {
      this.fetchFindDocumentsBySchemaId(newPage);
    } else {
      this.fetchSearchDocumentsWithSchema(this.term, newPage);
    }
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange(): void {
    this.fetchFindDocumentsBySchemaId();
  }

  @Watch('term')
  public handleTermChange(newTerm: string): void {
    if (newTerm !== '') {
      this.fetchSearchDocumentsWithSchema(newTerm);
    }
  }
}
</script>

<style lang="scss">
.all-schema-documents-page {
  background: #ffffff;
}

.dockite-element--pagination {
  padding: 1rem;
}
</style>
