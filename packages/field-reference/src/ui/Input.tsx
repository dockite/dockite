// TODO: We'll be back after this short intermission
import gql from 'graphql-tag';
import { Document, Schema } from '@dockite/types';
import {
  Operators,
  ConstraintArray,
  AndQuery,
  Constraint,
  PossibleConstraints,
} from '@dockite/where-builder';

import debounce from 'lodash/debounce';
import get from 'lodash/get';

import { DockiteFieldReferenceEntity, FieldToDisplayItem } from '../types';

import { SEARCH_DOCUMENTS_QUERY } from './graphql-queries';
import FilterInput from './components/filter-input.vue';
import { defineComponent } from 'vue';

export const InputComponent = defineComponent({
  name: 'DockiteFieldReferenceInputComponent',
  props: {},
  setup: (props, ctx) => {

    return () => {

    }
  }
})

<template>
  <el-form-item
    :label="fieldConfig.title"
    class="dockite-field-reference"
    :prop="name"
    :rules="rules"
  >
    <div v-if="fieldData" class="active-reference">
      <div>
        <span>{{ schemaName }}</span>
        <p>
          {{ documentIdentifier }} -
          <small>
            {{ fieldData.id }}
          </small>
        </p>
      </div>
      <a
        class="dockite-field reference remove cursor-pointer"
        @click.prevent="handleClearReference"
      >
        <i class="el-icon-close" />
      </a>
    </div>

    <div v-else class="dockite-field reference no-reference">
      <a @click="dialogVisible = true">Select a Document</a>
    </div>

    <el-dialog
      top="5vh"
      custom-class="dockite-dialog--reference-selection"
      :visible="dialogVisible"
      :destroy-on-close="true"
      title="Select a Document"
      @close="dialogVisible = false"
    >
      <el-row type="flex" justify="space-between" class="pb-3">
        <span />
        <el-input v-model="term" style="max-width: 400px;" placeholder="Search term" />
      </el-row>
      <div v-loading="loading > 0 && dialogVisible" class="border rounded px-1 pt-1">
        <el-table
          class="flex flex-col dockite-table--reference-selection"
          :data="documents"
          :row-key="record => record.id"
          max-height="60vh"
        >
          <el-table-column label="" width="25">
            <template slot-scope="scope">
              <input v-model="document" type="radio" :value="scope.row" />
            </template>
          </el-table-column>

          <el-table-column prop="id" label="ID">
            <template slot-scope="scope">
              {{ scope.row.id | shortDesc }}
            </template>
          </el-table-column>

          <el-table-column v-if="fieldsToDisplay.length === 0" label="Identifier">
            <template slot="header" slot-scope="{ column }">
              {{ column.label }}

              <!-- You gotta stop it from propogating twice for "reasons" -->
              <el-popover
                :ref="`filter-${column.label}`"
                width="250"
                trigger="click"
                class="dockite-table-filter--popover"
                @click.native.stop
              >
                <div
                  slot="reference"
                  class="el-table__column-filter-trigger w-full pb-1"
                  @click.stop
                >
                  <div
                    class="w-full border rounded h-6 px-2 text-xs font-normal flex justify-between items-center"
                    :class="{
                      'bg-gray-200': filters['identifier'],
                      'font-semibold': filters['identifier'],
                    }"
                  >
                    <template v-if="filters['identifier']">
                      <span>
                        {{ filters['identifier'].operator }} "{{ filters['identifier'].value }}"
                      </span>
                      <i
                        class="el-icon-close cursor-pointer hover:bg-gray-400 text-lg p-1 rounded-full"
                        @click.stop="filters['identifier'] = null"
                      />
                    </template>
                    <template v-else>
                      <span style="color: #D3D3D3">Filter</span>
                      <i class="el-icon-arrow-down cursor-pointer text-lg p-1 rounded-full" />
                    </template>
                  </div>
                </div>

                <filter-input
                  v-if="filters['identifier'] !== undefined"
                  v-model="filters['identifier']"
                  :options="supportedOperators"
                  prop="identifier"
                  @filter-change="handleFilterInputChange(column.label)"
                />
              </el-popover>
            </template>

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

          <el-table-column v-for="field in fieldsToDisplay" :key="field.name" :label="field.label">
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
                <div
                  slot="reference"
                  class="el-table__column-filter-trigger w-full pb-1"
                  @click.stop
                >
                  <div
                    class="w-full border rounded h-6 px-2 text-xs font-normal flex justify-between items-center"
                    :class="{
                      'bg-gray-200': filters[field.name],
                      'font-semibold': filters[field.name],
                    }"
                  >
                    <template v-if="filters[field.name]">
                      <span>
                        {{ filters[field.name].operator }} "{{ filters[field.name].value }}"
                      </span>
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
              <span>{{ scope.row.data[field.name] || 'N/A' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="schema.name" label="Schema">
            <template slot="header" slot-scope="{ column }">
              {{ column.label }}

              <!-- You gotta stop it from propogating twice for "reasons" -->
              <el-popover
                :ref="`filter-${column.label}`"
                width="250"
                trigger="click"
                class="dockite-table-filter--popover"
                @click.native.stop
              >
                <div
                  slot="reference"
                  class="el-table__column-filter-trigger w-full pb-1"
                  @click.stop
                >
                  <div
                    class="w-full border rounded h-6 px-2 text-xs font-normal flex justify-between items-center"
                    :class="{
                      'bg-gray-200': filters['schema.name'],
                      'font-semibold': filters['schema.name'],
                    }"
                  >
                    <template v-if="filters['schema.name']">
                      <span
                        >{{ filters['schema.name'].operator }} "{{
                          filters['schema.name'].value
                        }}"</span
                      >
                      <i
                        class="el-icon-close cursor-pointer hover:bg-gray-400 text-lg p-1 rounded-full"
                        @click.stop="filters['schema.name'] = null"
                      />
                    </template>
                    <template v-else>
                      <span style="color: #D3D3D3">Filter</span>
                      <i class="el-icon-arrow-down cursor-pointer text-lg p-1 rounded-full" />
                    </template>
                  </div>
                </div>

                <filter-input
                  v-if="filters['schema.name'] !== undefined"
                  v-model="filters['schema.name']"
                  :options="supportedOperators"
                  prop="schema.name"
                  @filter-change="handleFilterInputChange(column.label)"
                />
              </el-popover>
            </template>
          </el-table-column>
        </el-table>

        <div class="flex justify-between items-center py-3">
          <span class="text-gray-700 px-3" style="font-size: 13px">
            {{ paginationString }}
          </span>

          <el-pagination
            :current-page="page"
            class="dockite-element--pagination"
            style="line-height: 1;"
            :page-count="totalPages"
            :pager-count="5"
            :page-size="perPage"
            :total="totalItems"
            layout="jumper, prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-dialog>

    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">


const FIELD_UNDEFINED = 'FIELD:UNDEFINED';

interface SchemaResults {
  results: Schema[];
}

interface Reference {
  id: string;
  schemaId: string;
  identifier: string;
}

@Component({
  name: 'ReferenceFieldInputComponent',
  components: {
    FilterInput,
  },
})
export default class ReferenceFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: Reference | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldReferenceEntity;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  public rules: object[] = [];

  public documents: Document[] = [];

  public document: Document | null = null;

  public term = '';

  public dialogVisible = false;

  public page = 1;

  public perPage = 25;

  public totalPages = 0;

  public totalItems = 0;

  public loading = 1;

  public filters: Record<string, Constraint | null> = {
    'schema.name': null,
    identifier: null,
  };

  public supportedOperators = Operators;

  get fieldData(): Reference | null {
    return this.value;
  }

  set fieldData(value: Reference | null) {
    this.$emit('input', value);
  }

  get schemaName(): string | null {
    if (!this.document) {
      return null;
    }

    return this.document.schema.name;
  }

  get documentIdentifier(): string {
    if (!this.document) {
      return 'Unknown';
    }

    const { data } = this.document;

    if (data.name) {
      return data.name;
    }

    if (data.title) {
      return data.title;
    }

    if (data.identifier) {
      return data.identifier;
    }

    return this.document.id;
  }

  get paginationString(): string {
    let startingItem = (this.page - 1) * this.perPage + 1;
    const endingItem = startingItem + this.documents.length - 1;

    if (startingItem === 1 && endingItem === 0) {
      startingItem = 0;
    }

    return `Displaying documents ${startingItem} to ${endingItem} of ${this.totalItems}`;
  }

  get fieldsToDisplay(): FieldToDisplayItem[] {
    if (this.fieldConfig.settings.fieldsToDisplay) {
      return this.fieldConfig.settings.fieldsToDisplay;
    }

    return [];
  }

  get whereConstraints(): AndQuery | undefined {
    const filters: ConstraintArray = Object.values(this.filters)
      .filter(x => x !== null)
      .map(
        (filter): PossibleConstraints => {
          const f = filter as Constraint;

          if (f.name !== 'identifier') {
            return f;
          }

          return {
            AND: ['name', 'title', 'identifier'].map(name => ({
              OR: [
                {
                  ...f,
                  name,
                },
              ],
            })),
          };
        },
      );

    if (this.fieldConfig.settings.constraints && this.fieldConfig.settings.constraints.length > 0) {
      // Get the constraints from the field settings and replace the mustache syntax with actual values.
      const constraints: Constraint[] = [];

      this.fieldConfig.settings.constraints.forEach(con => {
        const value = con.value.replace(/{{ (.+) }}/g, (str, match) => {
          const path = match.replace('data.', '');

          const data = get(this.formData, path, str);

          if (typeof data === 'object' || Array.isArray(data)) {
            if (Array.isArray(data) && data.length === 0) {
              return FIELD_UNDEFINED;
            }

            if (data && Object.keys(data).length === 0) {
              return FIELD_UNDEFINED;
            }

            return JSON.stringify(data);
          }

          return String(data);
        });

        if (value === FIELD_UNDEFINED) {
          return;
        }

        constraints.push({ ...con, value });
      });

      filters.push(...constraints);
    }

    if (filters.length > 0) {
      return { AND: filters };
    }

    return undefined;
  }

  @Watch('fieldData', { immediate: true })
  handleFieldDataChange(): void {
    if (this.fieldData !== null) {
      this.getDocumentById();
    }
  }

  @Watch('document', { immediate: true })
  handleDocumentChange(): void {
    if (this.document !== null && this.document.id) {
      this.fieldData = {
        id: this.document.id,
        schemaId: this.document.schema.id,
        identifier: this.documentIdentifier,
      };

      this.dialogVisible = false;
    }
  }

  @Watch('term')
  handleTermChange(): void {
    this.handleTermChangeDebounced();
  }

  public handleTermChangeDebounced = debounce(() => {
    this.page = 1;

    this.findDocuments();
  }, 300);

  @Watch('whereConstraints', { deep: true })
  handleWhereConstraintsChange(): void {
    this.page = 1;

    this.findDocuments();
  }

  beforeMount(): void {
    if (!this.fieldData) {
      this.findDocuments();
    }

    if (
      this.fieldConfig.settings.fieldsToDisplay &&
      this.fieldConfig.settings.fieldsToDisplay.length > 0
    ) {
      this.fieldConfig.settings.fieldsToDisplay.forEach(f => {
        Vue.set(this.filters, f.name, null);
      });
    }

    if (this.fieldConfig.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    this.loading -= 1;
  }

  public getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  public async findDocuments(): Promise<void> {
    try {
      this.loading += 1;

      const { schemaIds } = this.fieldConfig.settings;
      const { page, term, perPage } = this;

      const { data } = await this.$apolloClient.query({
        query: SEARCH_DOCUMENTS_QUERY,
        variables: {
          schemaIds,
          page,
          perPage,
          term,
          where: this.whereConstraints,
        },
        fetchPolicy: 'network-only',
      });

      this.documents = data.searchDocuments.results;
      this.totalPages = data.searchDocuments.totalPages;
      this.totalItems = data.searchDocuments.totalItems;
      this.page = data.searchDocuments.currentPage;
    } catch (e) {
      console.log(e);

      this.$message({
        message:
          'An error occurred whilst fetching documents for reference selection, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public handlePageChange(newPage: number): void {
    this.page = newPage;
    this.findDocuments();
  }

  public async getDocumentById(): Promise<void> {
    if (!this.fieldData) {
      return;
    }

    const { id } = this.fieldData;

    const { data } = await this.$apolloClient.query({
      query: gql`
        query GetReferenceDocumentById($id: String!) {
          getDocument(id: $id) {
            id
            data
            updatedAt
            schema {
              id
              name
            }
          }
        }
      `,

      variables: {
        id,
      },
    });

    this.document = data.getDocument;
  }

  public handleClearReference(): void {
    this.fieldData = null;
    this.document = null;

    this.page = 1;

    this.findDocuments();
  }

  public handleFilterInputChange(fieldName: string): void {
    const ref = this.$refs[`filter-${fieldName}`] as any;

    if (Array.isArray(ref)) {
      ref.forEach(x => x.doClose());
    } else {
      ref.doClose();
    }
  }
}
</script>

<style lang="scss">
.dockite-field-reference {
  .active-reference {
    line-height: 1;

    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    display: flex;
    align-items: center;

    width: 100%;
    padding: 1rem;

    border: 1px solid #dcdfe6;
    border-radius: 4px;

    & > div {
      display: flex;
      flex-direction: column;

      flex-grow: 1;

      span {
        font-weight: bold;
      }

      p {
        margin: 0;
        padding: 0;

        small {
          color: rgba(0, 0, 0, 0.45);
          font-size: 0.875rem;
        }
      }
    }

    & > a {
      color: rgba(0, 0, 0, 0.65);

      &:hover {
        opacity: 0.75;
      }
    }
  }

  .no-reference {
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }

    a {
      border: 1px solid #dcdfe6;
      color: rgba(0, 0, 0, 0.65);
      border-radius: 4px;
      display: block;
      width: 100%;
      padding: 1rem;
      text-align: center;
      cursor: pointer;

      &:hover {
        opacity: 0.75;
        text-decoration: underline;
      }
    }
  }
}

.dockite-dialog--reference-selection {
  width: 80%;
  max-width: 1000px;

  .el-dialog__body {
    padding-top: 0;
  }

  .el-table__header-wrapper {
    overflow: initial;
  }
}

.dockite-table--reference-selection {
  th {
    padding: 0;
  }

  th .cell {
    white-space: nowrap;
    text-overflow: ellipsis;
    padding: 0.5rem 12px 1.8rem 12px;
    display: flex;
    align-items: center;
  }
}
</style>
