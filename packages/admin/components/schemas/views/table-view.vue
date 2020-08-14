<template>
  <div class="table-view">
    <portal to="header-extra">
      <el-input
        v-model="term"
        size="medium"
        style="max-width: 250px;"
        placeholder="Search"
        suffix-icon="el-icon-search"
      />
    </portal>

    <el-table
      v-loading="loading > 0"
      :data="findDocumentsBySchemaId.results"
      style="width: 100%;"
      class="dockite-table--document el-table--scrollable-x"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="selectable" fixed type="selection" width="55" />

      <el-table-column sortable="custom" prop="id" label="ID">
        <template slot-scope="scope">
          <router-link :to="`/documents/${scope.row.id}`">
            {{ scope.row.id | shortDesc }}
          </router-link>
        </template>
      </el-table-column>

      <el-table-column
        v-for="field in fieldsToDisplay"
        :key="field.name"
        sortable="custom"
        :label="field.title"
        :prop="`data.${field.name}`"
      >
        <template slot="header" slot-scope="{ column }">
          {{ column.label }} {{ filters.some(f => f.name === field.name) ? '*' : '' }}

          <!-- You gotta stop it from propogating twice for "reasons" -->
          <el-popover v-if="term === ''" width="250" trigger="click" @click.native.stop>
            <span slot="reference" class="el-table__column-filter-trigger" @click.stop>
              <i class="el-icon-arrow-down el-icon-arrow-up"></i>
            </span>

            <filter-input
              :options="supportedOperators"
              :prop="field.name"
              @add-filter="handleFilterAdd"
              @remove-filter="handleFilterRemove"
            />
          </el-popover>
        </template>

        <template slot-scope="scope">
          {{ scope.row.data[field.name] }}
        </template>
      </el-table-column>

      <el-table-column
        sortable="custom"
        prop="createdAt"
        label="Created"
        :formatter="cellValueFromNow"
      />

      <el-table-column
        sortable="custom"
        prop="updatedAt"
        label="Updated"
        :formatter="cellValueFromNow"
      />

      <el-table-column label="Actions">
        <span slot-scope="scope" class="dockite-table--actions">
          <router-link title="Edit Document" :to="`/documents/${scope.row.id}`">
            <i class="el-icon-edit-outline" />
          </router-link>
          <router-link
            v-if="$can('internal:document:delete')"
            title="Delete Document"
            :to="`/documents/${scope.row.id}/delete`"
          >
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
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/database';
import { DockiteGraphqlSortInput, DockiteSortDirection } from '@dockite/types';
import { SupportedOperators, Constraint } from '@dockite/where-builder';
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import {
  ManyResultSet,
  FindDocumentResultItem,
  SearchDocumentsWithSchemaResultItem,
  TableSortChangeEvent,
  TableSortDirection,
} from '../../../common/types';

import FilterInput from '~/components/base/filter-input.vue';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
    FilterInput,
  },
})
export default class SchemaDocumentsPage extends Vue {
  @Prop({ default: () => false })
  readonly selectable!: boolean;

  @Prop()
  readonly selectedItems!: Document[];

  public term = '';

  public filters: Constraint[] = [];

  public sortConfig: DockiteGraphqlSortInput | null = null;

  public supportedOperators = SupportedOperators;

  public loading = 0;

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

  get schema(): Schema {
    return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
  }

  get fieldsToDisplay(): Field[] {
    if (this.schema?.settings?.fieldsToDisplay) {
      return this.schema.settings.fieldsToDisplay
        .map((field: string) => this.schema.fields.find(f => f.name === field))
        .filter((field: Field | undefined) => !!field) as Field[];
    }

    return [];
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

  public async fetchFindDocumentsBySchemaId(page = 1): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchFindDocumentsBySchemaId`, {
        schemaId: this.schemaId,
        page,
        filters: this.filters,
        sort: this.sortConfig,
      });
    } catch (_) {
      this.$message({
        message: 'Failed to retrieve documents, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public async fetchSearchDocumentsWithSchema(term: string, page = 1): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSearchDocumentsWithSchema`, {
        term,
        page,
        schemaId: this.schemaId,
        sort: this.sortConfig,
      });
    } catch (_) {
      this.$message({
        message: 'Failed to retrieve documents, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
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

  public handleFilterAdd(constraint: Constraint): void {
    this.filters = [...this.filters.filter(f => f.name !== constraint.name), constraint];
  }

  public handleFilterRemove(name: string): void {
    this.filters = this.filters.filter(f => f.name !== name);
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

    this.fetchFindDocumentsBySchemaId(1);
  }

  public handleSelectionChange(items: Document[]): void {
    this.$emit(
      'update:selectedItems',
      items.map(i => i.id),
    );
  }

  @Watch('filters')
  handleFilterChange(): void {
    this.fetchFindDocumentsBySchemaId(1);
  }

  @Watch('schemaId', { immediate: true })
  handleSchemaIdChange(): void {
    this.fetchFindDocumentsBySchemaId(1);
    this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
      id: this.$route.params.id,
    });
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
.table-view {
  background: #ffffff;
}

.dockite-element--pagination {
  padding: 1rem;
}
</style>
