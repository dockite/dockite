<template>
  <div class="table-view">
    <div v-loading="loading > 0">
      <el-table
        ref="table"
        :data="selectedItems"
        style="width: 100%;"
        class="dockite-table--document el-table--scrollable-x"
        :row-key="getRowKeys"
        @selection-change="handleSelectionChange"
      >
        <el-table-column :reserve-selection="true" fixed type="selection" width="55" />

        <el-table-column sortable prop="id" label="ID">
          <template slot-scope="scope">
            <router-link :to="`/documents/${scope.row.id}`">
              {{ scope.row.id | shortDesc }}
            </router-link>
          </template>
        </el-table-column>

        <el-table-column
          v-for="field in fieldsToDisplay"
          :key="field.name"
          sortable
          :label="field.title"
          :prop="`data.${field.name}`"
        >
          <template slot="header" slot-scope="{ column }">
            {{ column.label }}
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

        <el-table-column sortable prop="createdAt" label="Created" :formatter="cellValueFromNow" />

        <el-table-column sortable prop="updatedAt" label="Updated" :formatter="cellValueFromNow" />

        <el-table-column label="Actions">
          <span slot-scope="scope" class="dockite-table--actions">
            <router-link title="Edit Document" :to="`/documents/${scope.row.id}`">
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

        <div v-if="selectedItems.length > 0" slot="append" class="w-full flex justify-between">
          <router-link
            :to="`/schemas/${schemaId}/bulk-edit?x-selected-items=${selectedItems.map(x => x.id)}`"
          ></router-link>
        </div>
      </el-table>

      <el-row type="flex" justify="space-between" align="middle" class="p-3">
        <span class="text-gray-700" style="font-size: 13px">
          {{ paginationString }}
        </span>

        <router-link :to="`/schemas/${schemaId}/bulk-edit`">
          <el-button>Update Selected Items</el-button>
        </router-link>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Schema, Field, Document } from '@dockite/database';
import { Operators } from '@dockite/where-builder';
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import { ITEMS_PER_PAGE } from '../../../common/constants';

import FilterInput from '~/components/base/filter-input.vue';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
    FilterInput,
  },
})
export default class SchemaDocumentsPage extends Vue {
  @Prop({ default: () => [] })
  readonly selectedItems!: Document[];

  public supportedOperators = Operators;

  public loading = 0;

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
    const endingItem = startingItem + this.selectedItems.length - 1;

    if (startingItem === 1 && endingItem === 0) {
      startingItem = 0;
    }

    return `Displaying documents ${startingItem} to ${endingItem} of ${this.selectedItems.length}`;
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
    return 1;
  }

  get totalPages(): number {
    return 1;
  }

  get totalItems(): number {
    if (!this.selectedItems.length) {
      return 1;
    }

    return this.selectedItems.length;
  }

  public getRowKeys(row: any): string {
    return row.id;
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  public handleSelectionChange(items: Document[]): void {
    console.log(items);
    this.$emit('update:selectedItems', items);
  }

  @Watch('selectedItems')
  public handleSelectedItemsChange(newItems: Document[]): void {
    (this.$refs.table as any).store.states.selection = newItems;
  }

  mounted(): void {
    this.handleSelectedItemsChange(this.selectedItems);
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
