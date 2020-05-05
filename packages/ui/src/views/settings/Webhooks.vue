<template>
  <div class="setttings-webhook bg-white">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>Settings - Webhooks</h1>

        <div>
          <router-link :to="`/settings/webhooks/history`" style="margin-right: 1rem;">
            <a-button type="secondary" size="large">
              History
              <a-icon type="history" />
            </a-button>
          </router-link>

          <a-button type="primary" size="large" @click="createWebhookDrawerVisible = true">
            Create
            <a-icon type="plus" />
          </a-button>
        </div>
      </a-row>
    </portal>

    <a-table
      class="webhook-table"
      :columns="columns"
      :data-source="allWebhooks.results"
      :row-key="getRowKey"
    >
      <router-link slot="id" slot-scope="id" :to="`/settings/webhooks/history/${id}`">
        {{ id }}
      </router-link>

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

      <template slot="updatedAt" slot-scope="updatedAt">
        {{ updatedAt | fromNow }}
      </template>
    </a-table>

    <a-drawer
      title="Create Webhook"
      width="40%"
      :visible="createWebhookDrawerVisible"
      :destroy-on-close="true"
      @close="handleCloseDrawer"
    >
      <a-form-model
        ref="form"
        class="webhook-form"
        :model="webhookConfig"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <a-form-model-item label="Name" prop="name">
          <a-input v-model="webhookConfig.name" />
          <span slot="extra">
            A friendly name for the Webhook, will be displayed in the table results.
          </span>
        </a-form-model-item>
        <a-form-model-item label="Address" prop="url">
          <a-input v-model="webhookConfig.url" type="url" />
          <span slot="extra">
            The Address (URL) to send the Webhook request to.
          </span>
        </a-form-model-item>
        <a-form-model-item label="Method" prop="method">
          <a-select v-model="webhookConfig.method">
            <a-select-option v-for="method in methods" :key="method">
              {{ method }}
            </a-select-option>
          </a-select>
          <span slot="extra">
            The HTTP method to use for the Webhook request.
          </span>
        </a-form-model-item>
        <a-form-model-item label="On Action" prop="actions">
          <a-select v-model="webhookConfig.options.actions" mode="multiple">
            <a-select-option v-for="action in actions" :key="action">
              {{ action }}
            </a-select-option>
          </a-select>
          <span slot="extra">
            The actions which will trigger the Webhook request.
          </span>
        </a-form-model-item>
        <a-form-model-item
          label="Execute GraphQL Query"
          :label-col="{ span: 20 }"
          label-align="left"
        >
          <a-switch v-model="showQueryFormField" />
          <span slot="extra">
            Execute a GraphQL query and send the result in the Webhook request, if not selected the
            item that was created/modified/delete will be sent.
          </span>
        </a-form-model-item>
        <a-form-model-item v-if="showQueryFormField" label="GraphQL Query">
          <vue-codemirror
            v-model="webhookConfig.options.query"
            style="font-size: 1rem; line-height: 1rem; margin-bottom: 0.5rem;"
            :options="codeMirrorOptions"
          />
          <span slot="extra">
            The GraphQL Query to be executed.
          </span>
        </a-form-model-item>
        <a-button type="primary" size="large" html-type="submit" block>
          Create
        </a-button>
      </a-form-model>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { WebhookAction, FindManyResult } from '@dockite/types';
import {
  getIntrospectionQuery,
  buildClientSchema,
  GraphQLSchema,
  IntrospectionQuery,
} from 'graphql';
import gql from 'graphql-tag';
import { codemirror as VueCodemirror } from 'vue-codemirror';
import { Vue, Component, Watch } from 'vue-property-decorator';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import { baseFindManyResult } from '../../common/base-find-many-result';

@Component({
  apollo: {
    allWebhooks: {
      query: gql`
        query {
          allWebhooks {
            results {
              id
              name
              method
              url
              updatedAt
            }
          }
        }
      `,
    },
  },

  components: {
    VueCodemirror,
  },
})
export class WebhooksPage extends Vue {
  public allWebhooks: FindManyResult<object> = { ...baseFindManyResult };

  public introspectionQuery = getIntrospectionQuery();

  public createWebhookDrawerVisible = false;

  public methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  public actions = WebhookAction;

  public introspectionResult: IntrospectionQuery | null = null;

  public showQueryFormField = false;

  public webhookConfig = {
    name: '',
    method: 'GET',
    url: '',
    options: { query: null, actions: [] },
  };

  get columns() {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        ellipsis: true,
        scopedSlots: { customRender: 'id' },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
      },
      {
        title: 'Method',
        dataIndex: 'method',
        scopedSlots: { customRender: 'method' },
      },
      {
        title: 'Address',
        dataIndex: 'url',
        scopedSlots: { customRender: 'url' },
      },
      {
        title: 'Last Updated',
        dataIndex: 'updatedAt',
        scopedSlots: { customRender: 'updatedAt' },
      },
    ];
  }

  get rules() {
    return {
      name: [
        {
          required: true,
          trigger: 'change',
          message: 'Name is required',
        },
      ],
      url: [
        {
          required: true,
          trigger: 'change',
          message: 'Address is required',
        },
        {
          type: 'url',
          trigger: 'change',
          message: 'Address must be a valid URL',
        },
      ],
      method: [
        {
          required: true,
          trigger: 'change',
          message: 'Method is required',
        },
        {
          type: 'enum',
          enum: this.methods,
          trigger: 'change',
          message: 'Method provided is invalid',
        },
      ],
      options: {
        actions: [
          {
            required: true,
            trigger: 'change',
            message: 'Actions is required',
          },
          {
            validator: (_rule: never, value: string[], callback: Function) => {
              if (
                value.filter(v => !Object.values(this.actions).includes(v as WebhookAction))
                  .length > 0
              ) {
                return callback(false);
              }

              return callback();
            },
            trigger: 'change',
            message: 'Action selected is invalid',
          },
        ],
      },
    };
  }

  get clientSchema(): GraphQLSchema | null {
    if (!this.introspectionResult) return null;

    return buildClientSchema(this.introspectionResult);
  }

  get codeMirrorOptions(): object {
    const options: Record<string, any> = {
      tabSize: 2,
      mode: 'graphql',
      theme: 'monokai',
      lineNumbers: true,
      line: true,
    };

    // TODO: Debug why lint/hints cause a call stack error
    if (this.introspectionResult) {
      // options.hintOptions = { schema: this.clientSchema };
    }

    return options;
  }

  public async handleSubmit() {
    try {
      await new Promise((resolve, reject) =>
        (this.$refs.form as any).validate((valid: boolean) => (valid ? resolve() : reject())),
      );

      await this.$store.dispatch('webhook/create', this.webhookConfig);

      this.$message.success('Webhook created successfully!');

      this.$apollo.queries.allWebhooks.refresh();
      this.handleCloseDrawer();
    } catch {
      this.$message.error('Unable to create webhook!');
    }
  }

  handleCloseDrawer() {
    this.createWebhookDrawerVisible = false;
    this.showQueryFormField = false;
    (this.$refs.form as any).resetFields();
  }

  getRowKey(record: { id: string }): string {
    return record.id;
  }

  @Watch('showQueryFormField')
  handleShowQueryFormFieldChange() {
    if (!this.showQueryFormField) {
      this.webhookConfig.options.query = null;
    }
  }

  async mounted() {
    const { data } = await this.$apollo.query({
      query: gql(this.introspectionQuery),
    });

    this.introspectionResult = data;
  }
}

export default WebhooksPage;
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
