<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" align="middle" justify="space-between">
        <h2>All Deleted Documents</h2>

        <router-link to="/documents">
          <el-button size="medium">
            <i class="el-icon-back" />
            Go Back
          </el-button>
        </router-link>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="all-documents-page el-loading-parent__min-height">
      <el-table
        :loading="documents.results.length === 0"
        :data="documents.results"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" sortable="custom">
          <template slot-scope="scope">
            <router-link
              v-if="scope.row.schema && scope.row.schema.type === schemaType.SINGLETON"
              :to="`/singletons/${scope.row.schema.id}`"
            >
              {{ scope.row.schema.id | shortDesc }}
            </router-link>
            <router-link v-else :to="`/documents/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>

        <el-table-column label="Identifier">
          <template slot-scope="scope">
            <span v-if="scope.row.schema && scope.row.schema.type === schemaType.SINGLETON">
              {{ scope.row.schema.title }}
            </span>
            <span v-else-if="scope.row.data.name" :title="scope.row.data.name">
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

        <el-table-column prop="schema.title" label="Schema">
          <template slot-scope="scope">
            <router-link
              v-if="scope.row.schema && scope.row.schema.type === schemaType.SINGLETON"
              :to="`/singletons/${scope.row.schema.id}`"
            >
              {{ scope.row.schema.id | shortDesc }}
            </router-link>
            <router-link v-else-if="scope.row.schema" :to="`/schemas/${scope.row.schema.id}`">
              {{ scope.row.schema.title }}
            </router-link>
            <span v-else>
              N/A
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="createdAt"
          label="Created"
          :formatter="cellValueFromNow"
          sortable="custom"
        />

        <el-table-column
          prop="updatedAt"
          label="Updated"
          :formatter="cellValueFromNow"
          sortable="custom"
        />

        <el-table-column label="Actions">
          <span slot-scope="scope" class="dockite-table--actions">
            <el-popconfirm
              title="Are you sure? The document will be restored and visible again."
              confirm-button-text="Restore"
              cancel-button-text="Cancel"
              @onConfirm="handleRestoreDocument(scope.row.id)"
            >
              <el-button
                v-if="$can('internal:document:update', `schema:${scope.row.schema.name}:update`)"
                slot="reference"
                type="text"
                title="Restore Document"
              >
                <i class="el-icon-refresh-left" />
              </el-button>
            </el-popconfirm>

            <router-link
              v-if="$can('internal:document:delete', `schema:${scope.row.schema.name}:delete`)"
              title="Delete Document"
              :to="`/documents/${scope.row.id}/delete`"
            >
              <i class="el-icon-delete" />
            </router-link>

            <router-link title="View Revisions" :to="`/documents/${scope.row.id}/revisions`">
              <i class="el-icon-folder-opened" />
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
import { User, SchemaType } from '@dockite/database';
import { DockiteGraphqlSortInput } from '@dockite/types';
import { DockiteSortDirection } from '@dockite/types/src';
import { formatDistanceToNow } from 'date-fns';
import { debounce } from 'lodash';
import { Component, Vue, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import {
  ManyResultSet,
  FindDocumentResultItem,
  AllDocumentsWithSchemaResultItem,
  TableSortChangeEvent,
  TableSortDirection,
} from '../../common/types';

import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    Fragment,
  },
})
export default class AllDocumentsPage extends Vue {
  public loading = 0;

  public term = '';

  public termDebounced = '';

  public schemaType = SchemaType;

  public sortConfig: DockiteGraphqlSortInput | null = null;

  get documents(): ManyResultSet<FindDocumentResultItem | AllDocumentsWithSchemaResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    if (!this.canViewAllDocuments) {
      return state.findDocumentsBySchemaIds;
    }

    if (this.term !== '') {
      return state.searchDocumentsWithSchema;
    }

    return state.allDocumentsWithSchema;
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
    return this.$ability.can(this.user?.normalizedScopes ?? [], 'internal:document:read');
  }

  get fetchTriggers(): object {
    return {
      schemaIds: this.schemaIds,
      term: this.termDebounced,
      sort: this.sortConfig,
    };
  }

  public fetchDocuments(page = 1): void {
    try {
      this.loading += 1;

      if (!this.canViewAllDocuments) {
        this.$store.dispatch(`${data.namespace}/fetchFindDocumentsBySchemaIds`, {
          schemaIds: this.schemaIds,
          page,
          sort: this.sortConfig,
          deleted: true,
        });
      } else if (this.termDebounced !== '') {
        this.$store.dispatch(`${data.namespace}/fetchSearchDocumentsWithSchema`, {
          term: this.termDebounced,
          page,
          sort: this.sortConfig,
        });

        return;
      } else {
        this.$store.dispatch(`${data.namespace}/fetchAllDocumentsWithSchema`, {
          page,
          sort: this.sortConfig,
          deleted: true,
        });
      }
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching documents, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async handleRestoreDocument(id: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${document.namespace}/restoreDocument`, { documentId: id });

      this.fetchDocuments();

      this.$message({
        message: 'Document successfully restored!',
        type: 'success',
      });
    } catch (e) {
      this.$message({
        message: 'Unable to restore document, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public updateTerm(newTerm: string): void {
    this.termDebounced = newTerm;
  }

  public updateTermDebounced = debounce(this.updateTerm, 200);

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  public handlePageChange(newPage: number): void {
    this.fetchDocuments(newPage);
  }

  public handleSortChange({ prop, order }: TableSortChangeEvent): void {
    if (order === null) {
      this.sortConfig = null;
    } else {
      this.sortConfig = {
        name: prop,
        direction:
          order === TableSortDirection.DESC ? DockiteSortDirection.DESC : DockiteSortDirection.ASC,
      };
    }
  }

  @Watch('term')
  public handleTermChange(newTerm: string): void {
    if (newTerm !== '') {
      this.updateTermDebounced(newTerm);
    }
  }

  @Watch('fetchTriggers', { immediate: true, deep: true })
  handleFetchTriggersChange(): void {
    this.fetchDocuments();
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
