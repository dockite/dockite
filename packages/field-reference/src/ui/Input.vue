<template>
  <a-form-model-item
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <div
      v-if="fieldData"
      class="dockite-field reference active-reference"
    >
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
        class="dockite-field reference remove"
        @click.prevent="handleClearReference"
      >
        <a-icon type="close" />
      </a>
    </div>
    <div
      v-else
      class="dockite-field reference no-reference"
    >
      <a @click="modalVisible = true">Select a Document</a>

      <a-modal
        :visible="modalVisible"
        :footer="null"
        title="Select a Document"
        width="50%"
        @cancel="modalVisible = false"
      >
        <a-table
          :columns="tableColumns"
          :data-source="documents"
          :row-key="(record) => record.id"
          :row-selection="rowSelectionConfig"
        >
          <template
            slot="data"
            slot-scope="data"
          >
            <span v-if="data.name">
              {{ data.name }}
            </span>
            <span v-else-if="data.title">
              {{ data.title }}
            </span>
            <span v-else-if="data.identifier">
              {{ data.identifier }}
            </span>
            <span v-else>
              {{ JSON.stringify(data).substr(0, 15) }}
            </span>
          </template>
        </a-table>
      </a-modal>
    </div>
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </a-form-model-item>
</template>

<script>
import gql from 'graphql-tag';
import { find } from 'lodash';

export default {
  name: 'ReferenceField',

  apollo: {
    allSchemas: {
      query: gql`
        query {
          allSchemas {
            results {
              id
              name
            }
          }
        }
      `,
    },
  },

  props: {
    name: {
      type: String,
      required: true,
    },

    value: {
      validator: (value) => typeof value === 'object' || value === null,
      required: true,
    },

    formData: {
      type: Object,
      required: true,
    },

    fieldConfig: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      allSchemas: { results: [] },
      documents: [],
      document: null,
      modalVisible: false,
      page: 1,
      perPage: 20,
    };
  },

  computed: {
    fieldData: {
      get() {
        if (this.value !== null) {
          return this.value;
        }

        return null;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    schemaName() {
      if (this.fieldData && this.allSchemas.results.length > 0) {
        return find(this.allSchemas.results, (s) => s.id === this.fieldData.schemaId).name;
      }

      return null;
    },

    documentIdentifier() {
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
    },

    tableColumns() {
      return [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          ellipsis: true,
        },
        {
          title: 'Identifier',
          dataIndex: 'data',
          key: 'data',
          scopedSlots: { customRender: 'data' },
        },
        {
          title: 'Schema',
          dataIndex: 'schema.name',
          key: 'schemaName',
        },
        {
          title: 'Last Updated',
          dataIndex: 'updatedAt',
        },
      ];
    },

    rowSelectionConfig() {
      return {
        type: 'radio',
        onSelect: (record) => {
          this.modalVisible = false;

          this.fieldData = {
            id: record.id,
            schemaId: record.schema.id,
          };
        },
      };
    },
  },

  watch: {
    fieldData: {
      immediate: true,
      handler() {
        if (this.fieldData) {
          this.getDocumentById();
        }
      },
    },
  },

  mounted() {
    if (!this.fieldData) {
      this.findDocuments();
    }

    const rules = [];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });
  },

  methods: {
    getRequiredRule() {
      return {
        required: true,
        message: `${this.fieldConfig.title} is required`,
        trigger: 'change',
      };
    },

    async findDocuments() {
      const { schemaIds } = this.fieldConfig.settings;
      const { page } = this;

      const { data } = await this.$apollo.query({
        query: gql`
          query FindDocumentsBySchemaIds(
            $schemaIds: [String!]
            $page: Int = 1
            $perPage: Int = 20
          ) {
            findDocuments(schemaIds: $schemaIds, page: $page, perPage: $perPage) {
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
          schemaIds,
          page,
        },
      });

      this.documents = data.findDocuments;
    },

    async getDocumentById() {
      const { id } = this.fieldData;
      const { data } = await this.$apollo.query({
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
    },

    handleClearReference() {
      this.fieldData = null;

      this.page = 1;

      this.findDocuments();
    },
  },
};
</script>

<style lang="scss">
.dockite-field.reference {
  &.active-reference {
    display: flex;
    align-items: center;

    width: 100%;
    padding: 1rem;

    border: 1px solid #d9d9d9;
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

  &.no-reference {
    a {
      border: 1px solid #d9d9d9;
      color: rgba(0, 0, 0, 0.65);
      border-radius: 4px;
      display: block;
      width: 100%;
      padding: 1rem;
      text-align: center;

      &:hover {
        opacity: 0.75;
        text-decoration: underline;
      }
    }
  }
}
</style>
