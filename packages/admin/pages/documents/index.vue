<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" align="middle" justify="space-between">
        <h2>All Documents</h2>

        <el-input
          v-if="canViewAllDocuments"
          v-model="term"
          size="medium"
          style="max-width: 250px"
          placeholder="Search"
          suffix-icon="el-icon-search"
        />
      </el-row>
    </portal>

    <div class="all-documents-page">
      <el-table
        :loading="documents.results.length === 0"
        :data="documents.results"
        style="width: 100%"
      >
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
        <el-table-column prop="schema.name" label="Schema">
          <template slot-scope="scope">
            <router-link v-if="scope.row.schema" :to="`/schemas/${scope.row.schema.id}`">
              {{ scope.row.schema.name }}
            </router-link>
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
import { User } from '@dockite/database';
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import {
  ManyResultSet,
  FindDocumentResultItem,
  AllDocumentsWithSchemaResultItem,
} from '../../common/types';

import * as auth from '~/store/auth';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllDocumentsPage extends Vue {
  public term = '';

  get documents(): ManyResultSet<FindDocumentResultItem | AllDocumentsWithSchemaResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    if (!this.canViewAllDocuments) {
      return state.findDocumentsBySchemaIds;
    }

    return this.term === '' ? state.allDocumentsWithSchema : state.searchDocumentsWithSchema;
  }

  get user(): User | null {
    const state: auth.AuthState = this.$store.state[auth.namespace];

    return state.user;
  }

  get schemaIds(): string[] {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSchemas.results.map(x => x.id);
  }

  get currentPage(): number {
    if (!this.documents.currentPage) {
      return 1;
    }

    return this.documents.currentPage;
  }

  get totalPages(): number {
    if (!this.documents.totalPages) {
      return 1;
    }

    return this.documents.totalPages;
  }

  get totalItems(): number {
    if (!this.documents.totalItems) {
      return 1;
    }

    return this.documents.totalItems;
  }

  get canViewAllDocuments(): boolean {
    return this.$ability.can(this.user.normalizedScopes ?? [], 'internal:document:read');
  }

  public fetchAllDocumentsWithSchema(page = 1): void {
    this.$store.dispatch(`${data.namespace}/fetchAllDocumentsWithSchema`, page);
  }

  public fetchFindDocumentsBySchemaIds(page = 1): void {
    this.$store.dispatch(`${data.namespace}/fetchFindDocumentsBySchemaIds`, {
      schemaIds: this.schemaIds,
      page,
    });
  }

  public fetchSearchDocumentsWithSchema(term: string, page = 1): void {
    this.$store.dispatch(`${data.namespace}/fetchSearchDocumentsWithSchema`, { term, page });
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  public handlePageChange(newPage: number): void {
    if (this.term === '') {
      this.canViewAllDocuments
        ? this.fetchAllDocumentsWithSchema(newPage)
        : this.fetchFindDocumentsBySchemaIds(newPage);
    } else {
      this.fetchSearchDocumentsWithSchema(this.term, newPage);
    }
  }

  @Watch('term')
  public handleTermChange(newTerm: string): void {
    if (newTerm !== '') {
      this.fetchSearchDocumentsWithSchema(newTerm);
    }
  }

  @Watch('schemaIds', { immediate: true })
  handleSchemaIdsChange(): void {
    if (this.schemaIds.length > 0) {
      this.canViewAllDocuments
        ? this.fetchAllDocumentsWithSchema()
        : this.fetchFindDocumentsBySchemaIds();
    }
  }
}
</script>

<style lang="scss">
.all-documents-page {
  background: #ffffff;
}

.dockite-element--pagination {
  padding: 1rem;
}
</style>
