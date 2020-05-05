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
      <template slot="id" slot-scope="data">
        <router-link :to="`/schema/${data.name}`">
          {{ data.id }}
        </router-link>
      </template>

      <router-link slot="name" slot-scope="name" :to="`/schema/${name}`">
        {{ name }}
      </router-link>

      <template slot="updatedAt" slot-scope="updatedAt">
        {{ updatedAt | fromNow }}
      </template>
      <template slot="createdAt" slot-scope="createdAt">
        {{ createdAt | fromNow }}
      </template>

      <template slot="actions" slot-scope="data">
        <a-row type="flex" align="middle" justify="center">
          <router-link style="padding: 0 0.25rem;" :to="`/schema/${data.name}/edit`">
            <a-icon type="edit" />
          </router-link>
          <a style="padding: 0 0.25rem;" title="Delete" @click.prevent="handleDelete(data.id)">
            <a-icon type="delete" />
          </a>
        </a-row>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { Schema, FindManyResult } from '@dockite/types';
import { gql } from 'apollo-boost';
import moment from 'moment';
import { Component, Vue } from 'vue-property-decorator';

import { baseFindManyResult } from '../../common/base-find-many-result';

@Component({
  apollo: {
    schemas: {
      query: gql`
        query {
          schemas: allSchemas {
            results {
              id
              name
              groups
              settings
              updatedAt
              createdAt
            }
          }
        }
      `,
    },
  },
})
export class SchemaTableView extends Vue {
  public moment = moment;

  public schemas: FindManyResult<Partial<Schema>> = { ...baseFindManyResult };

  get columns(): object[] {
    return [
      {
        title: 'ID',
        // dataIndex: 'id',
        ellipsis: true,
        scopedSlots: { customRender: 'id' },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
      },
      {
        title: 'Last Updated',
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

  get source(): Partial<Schema>[] {
    if (this.schemas.results && this.schemas.results.length > 0) {
      return this.schemas.results;
    }

    return [];
  }

  public getRowKey(row: Partial<Schema>) {
    return row.id;
  }

  public async handleDelete(schemaId: string) {
    await this.$store.dispatch('schema/delete', schemaId);

    this.$apollo.queries.schemas.refetch();
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
