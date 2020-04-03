<template>
  <div class="schema-table bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" class="title-row">
        <h1>All Documents</h1>
      </a-row>
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
import { Schema, Document } from '@dockite/types';
import { startCase } from 'lodash';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';

import FetchAllDocuments from '@/queries/AllDocuments.gql';

@Component({
  apollo: {
    allDocuments: {
      query: FetchAllDocuments,
    },
  },
})
export class AllDocumentPage extends Vue {
  public moment = moment;

  public allDocuments: Partial<Document>[] = [];

  get columns(): object[] {
    let slice: object[] = [];

    if (this.allDocuments && this.allDocuments.length > 0) {
      slice = Object.keys(this.allDocuments[0].data)
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
    if (this.allDocuments && this.allDocuments.length > 0) {
      return this.allDocuments;
    }

    return [];
  }

  public getRowKey(row: Partial<Schema>) {
    return row.id;
  }
}

export default AllDocumentPage;
</script>

<style lang="scss">
.schema-table-view ul.ant-table-pagination {
  padding: 0 16px;
}
</style>
