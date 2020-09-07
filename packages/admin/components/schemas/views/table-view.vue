<template>
  <div class="table-view">
    <portal v-if="!deleted" to="header-extra">
      <el-input
        v-model="term"
        size="medium"
        style="max-width: 250px;"
        placeholder="Search"
        suffix-icon="el-icon-search"
      />
    </portal>

    <div v-loading="loading > 0">
      <el-table
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
            {{ column.label }}

            <!-- You gotta stop it from propogating twice for "reasons" -->
            <el-popover
              v-if="term === ''"
              width="250"
              trigger="click"
              class="dockite-table-filter--popover"
              @click.native.stop
            >
              <div slot="reference" class="el-table__column-filter-trigger w-full pb-1" @click.stop>
                <div
                  class="w-full border rounded h-6 px-2 text-xs font-normal flex justify-between items-center"
                  :class="{
                    'bg-gray-200': filters[field.name],
                    'font-semibold': filters[field.name],
                  }"
                >
                  <template v-if="filters[field.name]">
                    <span
                      >{{ filters[field.name].operator }} "{{ filters[field.name].value }}"</span
                    >
                    <i
                      class="el-icon-close cursor-pointer hover:bg-gray-400 text-lg p-1 rounded-full"
                      @click.stop="filters[field.name] = null"
                    />
                  </template>
                  <template v-else>
                    <span style="color: #D3D3D3">Filter</span>
                    <i class="el-icon-arrow-down cursor-pointer text-lg p-1 rounded-full" />
                  </template>
                </div>
              </div>

              <filter-input
                v-if="filters[field.name] !== undefined"
                v-model="filters[field.name]"
                :options="supportedOperators"
                :prop="field.name"
              />
            </el-popover>
          </template>

          <template slot-scope="scope">
            <span v-if="field.type === 'reference' && scope.row.data[field.name]">
              {{ scope.row.data[field.name].identifier }}
            </span>

            <span v-else-if="field.type === 's3-image' && scope.row.data[field.name]">
              <i
                v-if="
                  Array.isArray(scope.row.data[field.name]) &&
                    scope.row.data[field.name].length === 0
                "
                class="el-icon-picture-outline font-xl"
              />

              <img
                v-else-if="
                  Array.isArray(scope.row.data[field.name]) && scope.row.data[field.name].length > 0
                "
                class="w-full mx-auto"
                style="max-width: 75px;"
                :src="scope.row.data[field.name][0].url"
                alt=""
              />

              <img
                v-else
                class="w-full mx-auto"
                style="max-width: 75px;"
                :src="scope.row.data[field.name].url"
                alt=""
              />
            </span>

            <span v-else>
              {{ scope.row.data[field.name] }}
            </span>
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
            <el-popconfirm
              v-if="deleted"
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

            <router-link v-else title="Edit Document" :to="`/documents/${scope.row.id}`">
              <i class="el-icon-edit-outline" />
            </router-link>

            <router-link
              v-if="
                $can(
                  'internal:document:delete',
                  `schema:${scope.row.schema && scope.row.schema.name}:delete`,
                )
              "
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

      <el-row type="flex" justify="space-between" align="middle">
        <span class="text-gray-700 px-3" style="font-size: 13px">
          {{ paginationString }}
        </span>

        <el-pagination
          :current-page="currentPage"
          class="dockite-element--pagination"
          :page-count="totalPages"
          :pager-count="5"
          :page-size="perPage"
          :total="totalItems"
          layout="jumper, prev, pager, next"
          @current-change="handlePageChange"
        />
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/database';
import { DockiteGraphqlSortInput, DockiteSortDirection } from '@dockite/types';
import { Operators, Constraint, ConstraintOperator } from '@dockite/where-builder';
import { formatDistanceToNow } from 'date-fns';
import { pickBy } from 'lodash';
import { Component, Vue, Watch, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ITEMS_PER_PAGE } from '../../../common/constants';

import {
  ManyResultSet,
  FindDocumentResultItem,
  SearchDocumentsWithSchemaResultItem,
  TableSortChangeEvent,
  TableSortDirection,
} from '~/common/types';
import { greedySplit } from '~/common/utils';
import FilterInput from '~/components/base/filter-input.vue';
import * as data from '~/store/data';
import * as document from '~/store/document';

@Component({
  components: {
    Fragment,
    FilterInput,
  },
})
export default class SchemaDocumentsPage extends Vue {
  @Prop({ default: () => false })
  readonly selectable!: boolean;

  @Prop({ default: () => [] })
  readonly selectedItems!: Document[];

  @Prop({ default: () => false })
  readonly deleted!: boolean;

  public term = '';

  public filters: Record<string, Constraint | null> = {};

  public sortConfig: DockiteGraphqlSortInput | null = null;

  public supportedOperators = Operators;

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

  get perPage(): number {
    return ITEMS_PER_PAGE;
  }

  get paginationString(): string {
    let startingItem = (this.currentPage - 1) * this.perPage + 1;
    const endingItem = startingItem + this.findDocumentsBySchemaId.results.length - 1;

    if (startingItem === 1 && endingItem === 0) {
      startingItem = 0;
    }

    return `Displaying documents ${startingItem} to ${endingItem} of ${this.findDocumentsBySchemaId.totalItems}`;
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
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchFindDocumentsBySchemaId`, {
        schemaId: this.schemaId,
        page,
        perPage: this.perPage,
        filters: Object.values(this.filters).filter(filter => filter !== null),
        sort: this.sortConfig,
        deleted: this.deleted,
      });
    } catch (_) {
      this.$message({
        message: 'Failed to retrieve documents, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async fetchSearchDocumentsWithSchema(term: string, page = 1): Promise<void> {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSearchDocumentsWithSchema`, {
        term,
        page,
        perPage: this.perPage,
        schemaId: this.schemaId,
        sort: this.sortConfig,
      });
    } catch (_) {
      this.$message({
        message: 'Failed to retrieve documents, please try again later.',
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

  public handlePageChange(newPage: number): void {
    this.$router.replace({
      query: {
        ...this.$route.query,
        'x-page': `${newPage}`,
      },
    });

    if (this.term === '') {
      this.fetchFindDocumentsBySchemaId(newPage);
    } else {
      this.fetchSearchDocumentsWithSchema(this.term, newPage);
    }
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

  public async handleRestoreDocument(id: string): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${document.namespace}/restoreDocument`, { documentId: id });

      this.handlePageChange(this.currentPage);

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
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  @Watch('filters', { deep: true })
  handleFilterChange(newValue: Record<string, Constraint | null>): void {
    const filters = Object.values(newValue).filter(x => x !== null);

    if (filters.length > 0) {
      const queryParams = filters.reduce((acc, curr) => {
        if (!curr) {
          return acc;
        }

        return {
          ...acc,
          [curr.name]: curr.operator + '|' + curr.value,
        };
      }, {});

      this.$router.push({
        query: {
          ...pickBy(this.$route.query as Record<string, string>, (key: string) =>
            key.startsWith('x-'),
          ),
          ...queryParams,
        },
      });
    }

    this.fetchFindDocumentsBySchemaId(Number(this.$route.query['x-page'] as string) || 1);
  }

  @Watch('schemaId', { immediate: true })
  async handleSchemaIdChange(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.$route.params.id,
      });

      this.schema.fields.forEach(field => {
        if (!this.filters[field.name]) {
          Vue.set(this.filters, field.name, null);
        }
      });

      this.handleRouteQueryChange();

      this.fetchFindDocumentsBySchemaId(Number(this.$route.query['x-page'] as string) || 1);
    } catch (err) {
      console.log(err);

      this.$message({
        message: 'An error occurred whilst fetching the schema, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  @Watch('$route.query', { deep: true })
  handleRouteQueryChange(): void {
    if (Object.keys(this.$route.query).length > 0) {
      const filters: Record<string, Constraint> = {};

      Object.keys(this.$route.query)
        .filter(key => !key.startsWith('x-'))
        .forEach(param => {
          const [operator, value] = greedySplit(this.$route.query[param] as string, '|', 1);

          filters[param] = {
            name: param,
            operator: operator as ConstraintOperator,
            value,
          };
        });

      this.filters = {
        ...this.filters,
        ...filters,
      };
    }
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

  .dockite-table--document {
    th {
      padding: 0;
    }

    th .cell {
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0.5rem 12px 1.5rem 12px;
      display: flex;
      align-items: center;
    }
  }
}

.dockite-element--pagination {
  padding: 1rem;
}

.dockite-table-filter--popover {
  position: absolute;
  width: 90%;
  bottom: 0;
  left: 12px;
}
</style>
