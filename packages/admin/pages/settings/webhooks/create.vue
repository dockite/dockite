<template>
  <fragment>
    <portal to="header">
      <h2>Create Webhook</h2>
    </portal>

    <div class="dockite-create-webhook-page">
      <el-form :model="form" :rules="formRules" label-position="top">
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
        <el-form-item v-if="willExecuteGraphQL" label="GraphQL Query">
          <el-input ref="graphqlEditor" v-model="form.options.query" type="textarea"></el-input>
          <!-- <textarea ref="graphqlEditor"></textarea> -->
        </el-form-item>
      </el-form>
    </div>
  </fragment>
</template>

<script lang="ts">
import { WebhookAction, Webhook } from '@dockite/types';
import CodeMirror from 'codemirror';
import { Component, Vue, Ref, Watch } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror/theme/nord.css';

import { RequestMethod } from '../../../common/types';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';

type WebhookForm = Omit<Webhook, 'id' | 'createdAt' | 'updatedAt'>;

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class CreateWebhookPage extends Vue {
  public form: WebhookForm = {
    name: '',
    url: '',
    method: RequestMethod.GET,
    options: { listeners: [] },
  };

  @Ref()
  readonly graphqlEditor!: any;

  public willExecuteGraphQL = false;

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  get webhookActions(): string[] {
    return Object.values(WebhookAction);
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
            required: this.willExecuteGraphQL,
            message: $t('validationMessages.required', ['GraphQL Query']),
            trigger: 'blur',
          },
        ],
      },
    };
  }

  @Watch('willExecuteGraphQL', { immediate: true })
  handleWillExecuteGraphQLChange(): void {
    if (this.willExecuteGraphQL) {
      this.form.options.query = '';

      this.$nextTick(() => {
        CodeMirror.fromTextArea(this.graphqlEditor.getInput() as HTMLTextAreaElement, {
          mode: 'graphql',
          theme: 'nord',
          tabSize: 2,
          lineNumbers: true,
          lineWrapping: true,
        });
      });
    } else {
      this.form.options.query = '';
    }
  }

  mounted(): void {
    this.form = this.initialFormState;
  }
}
</script>

<style>
.dockite-create-webhook-page {
  padding: 1rem;
  background: #ffffff;
}

.CodeMirror {
  line-height: normal;
  padding: 0.5rem 0;
}
</style>
