<template>
  <div class="setttings-webhook bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>Settings - Webhooks History</h1>
      </a-row>
    </portal>

    <a-table
      class="webhook-table"
      :columns="columns"
      :data-source="allWebhookCalls"
      :row-key="getRowKey"
    >
      <router-link slot="id" slot-scope="id" :to="`/settings/webhooks/history/${id}`">
        {{ id }}
      </router-link>

      <span slot="success" slot-scope="success">
        {{ success ? 'Yes' : 'No' }}
      </span>

      <template slot="actions" slot-scope="id">
        <a-row type="flex" align="middle" justify="center">
          <router-link title="Edit" style="padding: 0 0.25rem;" :to="`/documents/${id}`">
            <a-icon type="edit" />
          </router-link>
          <a style="padding: 0 0.25rem;" title="Delete" @click="handleDelete(id)">
            <a-icon type="delete" />
          </a>
        </a-row>
      </template>

      <template slot="executedAt" slot-scope="executedAt">
        {{ executedAt | fromNow }}
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import gql from 'graphql-tag';
import { Vue, Component, Watch } from 'vue-property-decorator';

@Component({
  apollo: {
    allWebhookCalls: {
      query: gql`
        query {
          allWebhookCalls {
            id
            success
            status
            executedAt
          }
        }
      `,
    },
  },
})
export class WebhooksHistoryPage extends Vue {
  public allWebhookCalls: object[] = [];

  get columns() {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        ellipsis: true,
        scopedSlots: { customRender: 'id' },
      },
      {
        title: 'Successful',
        dataIndex: 'success',
        scopedSlots: { customRender: 'success' },
      },
      {
        title: 'Request Status',
        dataIndex: 'status',
        scopedSlots: { customRender: 'status' },
      },
      {
        title: 'Executed At',
        dataIndex: 'executedAt',
        scopedSlots: { customRender: 'executedAt' },
      },
    ];
  }

  getRowKey(record: { id: string }): string {
    return record.id;
  }
}

export default WebhooksHistoryPage;
</script>

<style lang="scss">
.add-webhook-drawer {
  width: 100%;
  max-width: 400px;
}

.webhook-form {
  .ant-form-item {
    margin-bottom: 0.5rem;

    &:last-of-type {
      margin-bottom: 1rem;
    }
  }
}
</style>
