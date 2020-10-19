<template>
  <fragment>
    <portal to="header">
      <h2>Update Webhook</h2>
    </portal>

    <div v-loading="loading > 0" class="dockite-create-webhook-page el-loading-parent__min-height">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        @submit.native.prevent="submit"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>

        <el-form-item label="URL" prop="url">
          <el-input v-model="form.url"></el-input>
        </el-form-item>

        <el-form-item label="Request Method" prop="method">
          <el-select v-model="form.method" placeholder="Select" style="width: 100%">
            <el-option v-for="method in requestMethods" :key="method" :value="method">
              {{ method }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Listen to" prop="options.listeners">
          <el-select
            v-model="form.options.listeners"
            placeholder="Select"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option v-for="action in webhookActions" :key="action" :value="action">
              {{ action }}
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Execute GraphQL Query?">
          <el-switch v-model="willExecuteGraphQL"></el-switch>
        </el-form-item>
        <el-form-item v-if="willExecuteGraphQL" label="GraphQL Query" prop="options.query">
          <el-input ref="graphqlEditor" v-model="form.options.query" type="textarea"></el-input>
          <!-- <textarea ref="graphqlEditor"></textarea> -->
        </el-form-item>

        <el-form-item>
          <el-row type="flex" justify="space-between" align="middle">
            <span />
            <el-button
              v-if="$can('internal:webhook:create')"
              type="primary"
              :disabled="loading > 0"
              native-type="submit"
              @click.prevent="submit"
            >
              Update
            </el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Webhook } from '@dockite/database';
import { WebhookAction } from '@dockite/types';
import CodeMirror from 'codemirror';
import { Form } from 'element-ui';
import { cloneDeep, omit } from 'lodash';
import { Component, Vue, Ref, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror/theme/nord.css';

import {
  ManyResultSet,
  AllSchemasResultItem,
  AllSingletonsResultItem,
} from '../../../../common/types';

import { RequestMethod } from '~/common/types';
import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';
import * as data from '~/store/data';
import * as webhook from '~/store/webhook';

type WebhookForm = Omit<Webhook, 'id' | 'createdAt' | 'updatedAt' | 'calls'>;

@Component({
  components: {
    Fragment,
    Logo,
  },
  meta: {
    can: 'internal:webhook:update',
  },
})
export default class CreateWebhookPage extends Vue {
  public loading = 0;

  public form: WebhookForm = {
    name: '',
    url: '',
    method: RequestMethod.GET,
    options: { query: '', listeners: [] },
  };

  @Ref()
  readonly graphqlEditor!: any;

  @Ref()
  readonly formRef!: Form;

  public willExecuteGraphQL = false;

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get allSchemas(): ManyResultSet<AllSchemasResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSchemas;
  }

  get allSingletons(): ManyResultSet<AllSingletonsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.allSingletons;
  }

  get webhookId(): string {
    return this.$route.params.id;
  }

  get webhook(): Webhook | null {
    return this.$store.getters[`${data.namespace}/getWebhookById`](this.webhookId);
  }

  get webhookActions(): string[] {
    const actions: string[] = [];

    actions.push(...Object.values(WebhookAction));

    this.allSchemas.results.forEach(schema => {
      const schemaName = schema.name.toLowerCase();

      actions.push(
        `schema:${schemaName}:update`,
        `schema:${schemaName}:delete`,
        `document:${schemaName}:create`,
        `document:${schemaName}:update`,
        `document:${schemaName}:delete`,
      );
    });

    this.allSingletons.results.forEach(schema => {
      const schemaName = schema.name.toLowerCase();

      actions.push(
        `schema:${schemaName}:update`,
        `schema:${schemaName}:delete`,
        `document:${schemaName}:create`,
        `document:${schemaName}:update`,
        `document:${schemaName}:delete`,
      );
    });

    return actions;
  }

  get requestMethods(): string[] {
    return Object.values(RequestMethod);
  }

  get initialFormState(): WebhookForm {
    return {
      name: '',
      url: '',
      method: RequestMethod.GET,
      options: { listeners: [], query: '' },
    };
  }

  get formRules(): object {
    const $t = this.$t.bind(this);
    const queryRequired = this.willExecuteGraphQL;

    return {
      name: [
        {
          required: true,
          message: $t('validationMessages.required', ['Name']),
          trigger: 'blur',
        },
      ],
      url: [
        {
          required: true,
          message: $t('validationMessages.required', ['URL']),
          trigger: 'blur',
        },
        {
          type: 'url',
          message: 'Must be a valid URL',
          trigger: 'blur',
        },
      ],
      method: [
        {
          required: true,
          message: $t('validationMessages.required', ['Request Method']),
          trigger: 'blur',
        },
        {
          type: 'enum',
          message: 'Must be a valid request method',
          enum: Object.values(RequestMethod),
          trigger: 'blur',
        },
      ],
      options: {
        listeners: [
          {
            required: true,
            message: $t('validationMessages.required', ['Listen to']),
            trigger: 'blur',
          },
        ],
        query: [
          {
            required: queryRequired,
            message: $t('validationMessages.required', ['GraphQL Query']),
            trigger: 'blur',
          },
        ],
      },
    };
  }

  public async submit(): Promise<void> {
    try {
      this.loading += 1;

      await this.formRef.validate();

      const options = this.willExecuteGraphQL
        ? this.form.options
        : omit(this.form.options, 'query');

      await this.$store.dispatch(`${webhook.namespace}/updateWebhook`, {
        ...this.form,
        webhookId: this.webhookId,
        options: { ...options },
      });

      this.$message({
        message: 'Webhook updated successfully',
        type: 'success',
      });

      this.$router.push('/settings/webhooks');
    } catch (err) {
      console.log(err);
      this.$message({
        message:
          'Unable to update webhook, please ensure that the configuration is correct and try again.',
        type: 'warning',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  async fetchAllSchemas(): Promise<void> {
    if (this.allSchemas.results.length === 0) {
      await this.$store.dispatch(`${data.namespace}/fetchAllSchemas`);
    }
  }

  @Watch('webhook', { immediate: true })
  handleWebhookChange(): void {
    if (this.webhook) {
      this.form = {
        ...cloneDeep(this.webhook),
        options: {
          query: '',
          ...cloneDeep(this.webhook.options),
        },
      };

      if (this.webhook.options.query) {
        this.willExecuteGraphQL = true;
      }
    }
  }

  @Watch('willExecuteGraphQL', { immediate: true })
  handleWillExecuteGraphQLChange(): void {
    if (this.willExecuteGraphQL) {
      if (!this.form.options.query) {
        this.form.options.query = '';
      }

      this.$nextTick(() => {
        const editor = CodeMirror.fromTextArea(
          this.graphqlEditor.getInput() as HTMLTextAreaElement,
          {
            mode: 'graphql',
            theme: 'nord',
            tabSize: 2,
            lineNumbers: true,
            lineWrapping: true,
          },
        );

        editor.on('change', cm => {
          Vue.set(this.form.options, 'query', cm.getValue());
        });

        editor.on('blur', _ => {
          this.graphqlEditor.focus();
          this.graphqlEditor.blur();
        });
      });
    } else {
      this.form.options.query = '';
    }
  }

  @Watch('webhookId', { immediate: true })
  public handleWebhookIdChange(): void {
    this.fetchWebhookById();
  }

  public fetchWebhookById(): void {
    this.$store.dispatch(`${data.namespace}/fetchWebhookById`, {
      id: this.webhookId,
    });
  }

  mounted(): void {
    this.fetchWebhookById();
    this.fetchAllSchemas();
  }
}
</script>

<style lang="scss">
.dockite-create-webhook-page {
  padding: 1rem;
  background: #ffffff;
}

.el-form-item.is-error {
  .CodeMirror {
    border: 1px solid #f56c6c;
  }
}

.CodeMirror {
  line-height: normal;
  padding: 0.5rem 0;
  margin-bottom: 0.25rem;
}
</style>
