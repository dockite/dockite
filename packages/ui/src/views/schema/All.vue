<template>
  <div class="schema-table bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>All Schemas</h1>
        <router-link :to="`/schema/create`">
          <a-button type="primary" size="large">
            Create
            <a-icon type="plus" />
          </a-button>
        </router-link>
      </a-row>
    </portal>
    <a-table
      class="schema-table-view"
      :columns="columns"
      :data-source="source"
      :row-key="getRowKey"
    >
      <router-link slot="id" slot-scope="id" :to="`/schema/${id}`">
        {{ id }}
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
import { Schema } from '@dockite/types';
import { gql } from 'apollo-boost';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  apollo: {
    schemas: {
      query: gql`
        query {
          schemas: allSchemas {
            id
            name
            groups
            settings
            updatedAt
            createdAt
          }
        }
      `,
    },
  },
})
export class SchemaTableView extends Vue {
  public moment = moment;

  public schemas!: Partial<Schema>[];

  get columns(): object[] {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        scopedSlots: { customRender: 'id' },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
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
    if (this.schemas && this.schemas.length > 0) {
      return this.schemas;
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
.schema-table {
  background: #fff;
}

.schema-table-view ul.ant-table-pagination {
  padding: 0 16px;
}
</style>
