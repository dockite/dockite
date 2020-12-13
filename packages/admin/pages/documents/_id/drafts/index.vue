<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" align="middle" justify="space-between">
        <h2>Drafts: {{ documentId }}</h2>

        <div class="flex justify-between items-center">
          <router-link :to="`/documents/${documentId}/drafts/create`">
            <el-button>
              Create new Draft
            </el-button>
          </router-link>
        </div>
      </el-row>
    </portal>

    <div class="document-drafts-page bg-white">
      <el-table
        ref="table"
        :data="drafts.results"
        style="width: 100%;"
        class="dockite-table--document el-table--scrollable-x"
        :row-key="getRowKeys"
        @sort-change="handleSortChange"
      >
        <el-table-column sortable="custom" prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/documents/${documentId}/drafts/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="name" label="Draft Name">
          <template slot-scope="scope">
            <router-link :to="`/documents/${documentId}/drafts/${scope.row.id}`">
              {{ scope.row.name }}
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
              :ref="`filter-${field.name}`"
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
                @filter-change="handleFilterInputChange(field.name)"
              />
            </el-popover>
          </template>

          <template slot-scope="scope">
            <span v-if="field.type.includes('reference') && scope.row.data[field.name]">
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
  </fragment>
</template>

<script lang="ts">
import { Draft, Schema, Field } from '@dockite/database';
import { DockiteGraphqlSortInput, DockiteSortDirection } from '@dockite/types';
import { Constraint, Operators } from '@dockite/where-builder';
import { formatDistanceToNow } from 'date-fns';
import { Component, Watch, Vue } from 'nuxt-property-decorator';

import { ITEMS_PER_PAGE } from '~/common/constants';
import { TableSortChangeEvent, TableSortDirection, ManyResultSet } from '~/common/types';
import FilterInput from '~/components/base/filter-input.vue';
import * as data from '~/store/data';
// import * as document from '~/store/document';

@Component({
  name: 'DocumentDraftsPage',
  components: {
    FilterInput,
  },
})
export default class DocumentDraftsPage extends Vue {
  public loading = 1;

  public sortConfig: DockiteGraphqlSortInput | null = null;

  public filters: Record<string, Constraint | null> = {};

  public supportedOperators = Operators;

  get documentId(): string {
    return this.$route.params.id;
  }

  get drafts(): ManyResultSet<Draft> {
    return this.$store.state[data.namespace].allDraftsForDocument;
  }

  get schema(): Schema | null {
    if (this.drafts.results && this.drafts.results.length > 0) {
      return this.drafts.results[0].schema;
    }

    return null;
  }

  get paginationString(): string {
    let startingItem = (this.currentPage - 1) * this.perPage + 1;
    const endingItem = startingItem + this.drafts.results.length - 1;

    if (startingItem === 1 && endingItem === 0) {
      startingItem = 0;
    }

    return `Displaying documents ${startingItem} to ${endingItem} of ${this.totalItems}`;
  }

  get fieldsToDisplay(): Field[] {
    if (this.schema && this.schema.settings.fieldsToDisplay) {
      const schema = this.schema;

      return this.schema.settings.fieldsToDisplay
        .map((field: string) => schema.fields.find(f => f.name === field))
        .filter((field: Field | undefined) => !!field) as Field[];
    }

    return [];
  }

  get perPage(): number {
    return ITEMS_PER_PAGE;
  }

  get currentPage(): number {
    if (!this.drafts.currentPage) {
      return 1;
    }

    return this.drafts.currentPage;
  }

  get totalPages(): number {
    if (!this.drafts.totalPages) {
      return 1;
    }

    return this.drafts.totalPages;
  }

  get totalItems(): number {
    if (!this.drafts.totalItems) {
      return 1;
    }

    return this.drafts.totalItems;
  }

  public handleFilterInputChange(fieldName: string): void {
    const ref = this.$refs[`filter-${fieldName}`] as any;

    if (Array.isArray(ref)) {
      ref.forEach(x => x.doClose());
    } else {
      ref.doClose();
    }
  }

  public getRowKeys(row: any): string {
    return row.id;
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

    this.fetchDraftsForDocument(newPage);
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

    this.fetchDraftsForDocument(1);
  }

  public async fetchDraftsForDocument(page = 1): Promise<void> {
    await this.$store.dispatch(`${data.namespace}/fetchAllDraftsForDocument`, {
      documentId: this.documentId,
      page,
      filters: Object.values(this.filters).filter(filter => filter !== null),
      sort: this.sortConfig,
    });
  }

  @Watch('schema', { deep: true })
  public handleSchemaChange(): void {
    if (this.schema) {
      this.schema.fields.forEach(field => {
        if (!this.filters[field.name]) {
          Vue.set(this.filters, field.name, null);
        }
      });
    }
  }

  beforeMount(): void {
    this.fetchDraftsForDocument();

    this.loading -= 1;
  }
}
</script>

<style></style>
