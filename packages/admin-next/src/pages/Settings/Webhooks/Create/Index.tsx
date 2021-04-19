import CodeMirror from 'codemirror';
import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';

import { Webhook } from '@dockite/database';

import { createWebhookFormRules } from './formRules';

import { fetchAllSchemas, fetchAllSingletons } from '~/common/api';
import {
  DASHBOARD_HEADER_PORTAL_TITLE,
  DEFAULT_LISTENERS,
  MAX_32_BIT_INT,
} from '~/common/constants';
import { logE } from '~/common/logger';
import { RenderIfComponent } from '~/components/Common/RenderIf';

import 'codemirror-graphql/mode';

import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/lint/json-lint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/search/search';

import 'codemirror/lib/codemirror.css';

import 'codemirror/theme/nord.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/lint/lint.css';

export type BaseWebhook = Pick<Webhook, 'name' | 'method' | 'url' | 'options'>;

export const CreateWebhookPage = defineComponent({
  name: 'CreateWebhookPage',

  setup: () => {
    const webhook = ref<BaseWebhook>({
      name: '',
      method: 'GET',
      url: '',
      options: {
        listeners: [],
        query: '',
        constraints: [],
      },
    });

    const performGraphQLQuery = ref(false);

    const textarea = ref<HTMLTextAreaElement | null>(null);

    const editor = ref<CodeMirror.Editor | null>(null);

    const schemas = usePromise(() => fetchAllSchemas(MAX_32_BIT_INT));

    const singletons = usePromise(() => fetchAllSingletons(MAX_32_BIT_INT));

    const handleCreateWebhook = usePromiseLazy(async () => {
      try {
        throw new Error('Not implemented');
      } catch (err) {
        logE(err);

        ElMessage.error(
          'An error occurred while attempting to create the webhook, please try again shortly.',
        );
      }
    });

    const availableListeners = computed(() => {
      const listeners: string[] = [...DEFAULT_LISTENERS];

      (schemas.result.value || []).forEach(schema => {
        const name = schema.name.toLowerCase();

        listeners.push(
          `schema:${name}:update`,
          `schema:${name}:delete`,
          `document:${name}:create`,
          `document:${name}:update`,
          `document:${name}:delete`,
        );
      });

      (singletons.result.value || []).forEach(singleton => {
        const name = singleton.name.toLowerCase();

        listeners.push(
          `schema:${name}:update`,
          `schema:${name}:delete`,
          `document:${name}:create`,
          `document:${name}:update`,
          `document:${name}:delete`,
        );
      });

      return listeners;
    });

    watch(performGraphQLQuery, value => {
      if (value && textarea.value) {
        editor.value = CodeMirror.fromTextArea(textarea.value, {
          mode: 'graphql',
          theme: 'nord',

          autoCloseBrackets: true,
          autoRefresh: true,
          gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers'],
          lineNumbers: true,
          lineWrapping: true,
          lint: true,
          matchBrackets: true,
          tabSize: 2,
        });

        editor.value.on('change', cm => {
          webhook.value.options.query = cm.getValue();
        });
      }
    });

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Create a Webhook</Portal>

          <div
            v-loading={
              handleCreateWebhook.loading.value || schemas.loading.value || singletons.loading.value
            }
          >
            <el-form labelPosition="top" model={webhook.value} rules={createWebhookFormRules}>
              <el-form-item prop="name" label="Name">
                <el-input v-model={webhook.value.name} />
              </el-form-item>

              <el-form-item prop="method" label="Method">
                <el-select v-model={webhook.value.method}>
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="PATCH" value="PATCH" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </el-form-item>

              <el-form-item prop="url" label="URL">
                <el-input v-model={webhook.value.url} />
              </el-form-item>

              <el-form-item prop="options.listeners" label="Listen To">
                {/* This has to be key'd since it doesn't handle changes to the computed property well? */}
                <el-select
                  class="w-full"
                  v-model={webhook.value.options.listeners}
                  key={availableListeners.value.length}
                  multiple
                  filterable
                >
                  {availableListeners.value.map(listener => (
                    <el-option label={listener} value={listener} />
                  ))}
                </el-select>
              </el-form-item>

              <RenderIfComponent condition={webhook.value.method !== 'GET'}>
                <el-form-item label="Perform GraphQL Query?">
                  <el-switch v-model={performGraphQLQuery.value} />
                </el-form-item>
              </RenderIfComponent>

              <RenderIfComponent
                condition={webhook.value.method !== 'GET' && performGraphQLQuery.value}
              >
                <el-form-item prop="options.query" label="GraphQL Query to Execute">
                  <textarea ref={textarea} />
                </el-form-item>
              </RenderIfComponent>
            </el-form>
          </div>
        </>
      );
    };
  },
});
