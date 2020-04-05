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

      <template slot="updatedAt" slot-scope="updatedAt">
        {{ moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template slot="createdAt" slot-scope="createdAt">
        {{ moment(createdAt).format('YYYY-MM-DD HH:mm:ss') }}
      </template>

      <template slot="actions" slot-scope="data">
        <a-row type="flex" align="middle" justify="center">
          <router-link title="Edit" style="padding: 0 0.25rem;" :to="`/documents/${data.id}`">
            <a-icon type="edit" />
          </router-link>
          <a style="padding: 0 0.25rem;" title="Delete" @click="handleDelete(data.id)">
            <a-icon type="delete" />
          </a>
        </a-row>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { Schema, Document } from '@dockite/types';
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
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        scopedSlots: { customRender: 'id' },
      },
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
      {
        title: 'Actions',
        scopedSlots: { customRender: 'actions' },
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

  public async handleDelete(documentId: string) {
    await this.$store.dispatch('document/delete', documentId);

    this.$apollo.queries.allDocuments.refetch();
  }
}

export default AllDocumentPage;
</script>

<style lang="scss">
.schema-table-view ul.ant-table-pagination {
  padding: 0 16px;
}
</style>
