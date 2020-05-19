<template>
  <el-form-item
    :label="fieldConfig.title"
    :colon="true"
  >
    <el-table
      :columns="tableColumns"
      :datel-source="referenceOfDocuments"
      :row-key="(record) => record.id"
    >
      <router-link
        slot="id"
        slot-scope="id"
        :to="`/documents/${id}`"
      >
        {{ id }}
      </router-link>

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
    </el-table>
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </el-form-item>
</template>

<script>
import gql from 'graphql-tag';

export default {
  name: 'ReferenceOfField',

  apollo: {
    referenceOfDocuments: {
      query: gql`
        query FindReferenceOfDocuments(
          $documentId: String!
          $schemaId: String!
          $fieldName: String!
          $page: Int! = 1
          $perPage: Int! = 20
        ) {
          referenceOfDocuments: resolveReferenceOf(
            documentId: $documentId,
            schemaId: $schemaId,
            fieldName: $fieldName,
            page: $page,
            perPage: $perPage,
          ) {
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
      variables() {
        return {
          documentId: this.$route.params.id,
          schemaId: this.fieldConfig.settings.schemaId,
          fieldName: this.fieldConfig.settings.fieldName,
          page: this.page,
          perPage: this.perPage,
        };
      },
    },
  },

  props: {
    name: {
      type: String,
      required: true,
    },

    value: {
      validator: (value) => value === null,
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
      referenceOfDocuments: [],
      page: 1,
      perPage: 20,
    };
  },

  computed: {
    tableColumns() {
      return [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'id',
          ellipsis: true,
          scopedSlots: { customRender: 'id' },
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
  },
};
</script>

<style lang="scss">
</style>
