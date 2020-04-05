<template>
  <div class="schema-table bg-white">
    <portal to="title">
      <a-row style="height:64px;" type="flex" align="middle" justify="space-between">
        <h1 style="margin: 0;">{{ schema && schema.name ? schema.name : 'Loading...' }}</h1>
        <div>
          <router-link v-if="schema && schema.name" :to="`/schema/${schema.name}/edit`">
            <a-button size="large">
              Edit
            </a-button>
          </router-link>
          <router-link v-if="schema && schema.name" :to="`/schema/${schema.name}/create`">
            <a-button style="margin-left: 1rem;" type="primary" size="large">
              Create
              <a-icon type="plus" />
            </a-button>
          </router-link>
        </div>
      </a-row>
    </portal>
    <a-table
      class="schema-table-view"
      :columns="columns"
      :data-source="source"
      :row-key="getRowKey"
    >
      <router-link slot="id" slot-scope="text" :to="`/documents/${text}`">
        {{ text }}
      </router-link>

      <span slot="updatedAt" slot-scope="updatedAt">
        {{ moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
      </span>
    </a-table>
  </div>
</template>

<script lang="ts">
import { Schema, Document } from '@dockite/types';
import { gql } from 'apollo-boost';
import { startCase } from 'lodash';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  apollo: {
    schema: {
      query: gql`
        query GetSchema($name: String) {
          schema: getSchema(name: $name) {
            id
            name
            groups
            settings
            fields {
              id
              name
            }
          }
        }
      `,

      variables() {
        return {
          name: this.$route.params.schema,
        };
      },
    },

    documents: {
      query: gql`
        query FindDocumentsForSchema($schemaId: String) {
          documents: findDocuments(schemaId: $schemaId) {
            id
            createdAt
            updatedAt
            data
          }
        }
      `,

      variables() {
        const schemaId = this.schema?.id ?? '';

        return {
          schemaId,
        };
      },
    },
  },
})
export class SchemaTableView extends Vue {
  public schema!: Partial<Schema>;

  public moment = moment;

  public documents!: Partial<Document>[];

  get columns(): object[] {
    if (this.schema && this.schema.fields) {
      const slice = this.schema.fields.slice(0, 5).map(x => ({
        title: startCase(x.name),
        dataIndex: x.name,
        scopedSlots: { customRender: x.name },
      }));

      return [
        {
          title: 'ID',
          dataIndex: 'id',
          scopedSlots: { customRender: 'id' },
        },
        ...slice,
        {
          title: 'Updated At',
          dataIndex: 'updatedAt',
          scopedSlots: { customRender: 'updatedAt' },
        },
      ];
    }

    return [
      {
        title: 'ID',
        dataIndex: 'id',
        scopedSlots: { customRender: 'id' },
      },
      {
        title: 'Updated At',
        dataIndex: 'updatedAt',
        scopedSlots: { customRender: 'updatedAt' },
      },
    ];
  }

  get source() {
    if (this.documents && this.documents.length > 0) {
      return this.documents.map(doc => {
        const data = doc.data ?? {};

        return { ...doc, ...data };
      });
    }

    return [];
  }

  public getRowKey(row: Partial<Document>) {
    return row.id;
  }
}

export default SchemaTableView;
</script>

<style lang="scss">
.schema-table-view ul.ant-table-pagination {
  padding: 0 16px;
}
</style>
