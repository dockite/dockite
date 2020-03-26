<template>
  <div class="schema-table">
    <portal to="title">
      <h1>All Documents</h1>
    </portal>
    <a-table
      class="schema-table-view"
      :columns="columns"
      :data-source="source"
      :row-key="getRowKey"
    >
      <router-link slot="id" slot-scope="id" :to="`/documents/${id}`">
        {{ id }}
      </router-link>

      <router-link slot="schema" slot-scope="schema" :to="`/schema/${schema}`">
        {{ schema }}
      </router-link>

      <span slot="updatedAt" slot-scope="updatedAt">
        {{ moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
      </span>
      <span slot="createdAt" slot-scope="createdAt">
        {{ moment(createdAt).format('YYYY-MM-DD HH:mm:ss') }}
      </span>
    </a-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { gql } from 'apollo-boost';
import { Schema, Document } from '@dockite/types';
import { startCase } from 'lodash';
import moment from 'moment';

@Component({
  apollo: {
    documents: {
      query: gql`
        query {
          documents: allDocuments {
            id
            data
            updatedAt
            createdAt
            schema {
              name
            }
          }
        }
      `,
    },
  },
})
export class SchemaTableView extends Vue {
  public moment = moment;

  public documents!: Partial<Document>[];

  get columns(): object[] {
    let slice: object[] = [];

    if (this.documents && this.documents.length > 0) {
      slice = Object.keys(this.documents[0].data)
        .slice(0, 2)
        .map(x => ({
          title: startCase(x),
          dataIndex: `data.${x}`,
        }));
    }

    return [
      {
        title: 'ID',
        dataIndex: 'id',
        scopedSlots: { customRender: 'id' },
      },
      ...slice,
      {
        title: 'Schema',
        dataIndex: 'schema.name',
        scopedSlots: { customRender: 'schema' },
      },
      {
        title: 'Updated At',
        dataIndex: 'updatedAt',
        scopedSlots: { customRender: 'updatedAt' },
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        scopedSlots: { customRender: 'createdAt' },
      },
    ];
  }

  get source() {
    if (this.documents && this.documents.length > 0) {
      return this.documents;
    }

    return [];
  }

  public getRowKey(row: Partial<Schema>) {
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
