import CodeMirror from 'codemirror';
import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRouter } from 'vue-router';

import { createWebhookFormRules } from './formRules';

import { fetchAllSchemas, fetchAllSingletons } from '~/common/api';
import { createWebhook } from '~/common/api/webhook';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  MAX_32_BIT_INT,
} from '~/common/constants';
import { logE } from '~/common/logger';
import { BaseWebhook, FieldErrorList } from '~/common/types';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { WebhookConstraintBuilderComponent } from '~/components/Settings/Webhooks/ConstraintBuilder';
import { displayClientValidationErrors, getAvailableWebhookListeners } from '~/utils';

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

import './Index.scss';

export const CreateWebhookPage = defineComponent({
  name: 'CreateWebhookPage',

  setup: () => {
    const router = useRouter();

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

    const formEl = ref<any | null>(null);

    const performGraphQLQuery = ref(false);

    const applyWebhookConstraints = ref(false);

    const textarea = ref<HTMLTextAreaElement | null>(null);

    const editor = ref<CodeMirror.Editor | null>(null);

    const schemas = usePromise(() => fetchAllSchemas(MAX_32_BIT_INT));

    const singletons = usePromise(() => fetchAllSingletons(MAX_32_BIT_INT));

    const handleCreateWebhook = usePromiseLazy(async () => {
      try {
        if (!formEl.value) {
          return;
        }

        const valid = await formEl.value.validate().catch((e: FieldErrorList) => e);

        if (valid !== true) {
          displayClientValidationErrors(valid);

          return;
        }

        const result = await createWebhook(webhook.value);

        ElMessage.success('Webhook created successfully!');

        router.push(`/settings/webhooks/${result.id}}`);
      } catch (err) {
        logE(err);

        ElMessage.error(
          'An error occurred while attempting to create the webhook, please try again shortly.',
        );
      }
    });

    const availableListeners = computed(() =>
      getAvailableWebhookListeners(schemas.result.value || [], singletons.result.value || []),
    );

    watch(performGraphQLQuery, value => {
      if (value) {
        // We wait for the next tick so textarea may mount since it's v-if'd
        nextTick(() => {
          if (textarea.value) {
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
      }
    });

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Create a Webhook</Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <el-button
              type="primary"
              onClick={handleCreateWebhook.exec}
              disabled={handleCreateWebhook.loading.value}
            >
              Create Webhook
            </el-button>
          </Portal>

          <div
            v-loading={
              handleCreateWebhook.loading.value || schemas.loading.value || singletons.loading.value
            }
          >
            <el-form
              ref={formEl}
              labelPosition="top"
              model={webhook.value}
              rules={createWebhookFormRules}
            >
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

              <el-form-item label="Apply constraints to Webhook?">
                <el-switch v-model={applyWebhookConstraints.value} />
              </el-form-item>

              <RenderIfComponent condition={applyWebhookConstraints.value}>
                <el-form-item label="Constraints">
                  <WebhookConstraintBuilderComponent v-model={webhook.value.options.constraints} />
                </el-form-item>
              </RenderIfComponent>

              <RenderIfComponent condition={webhook.value.method !== 'GET'}>
                <el-form-item label="Perform GraphQL Query?">
                  <el-switch v-model={performGraphQLQuery.value} />
                </el-form-item>
              </RenderIfComponent>

              <RenderIfComponent
                condition={webhook.value.method !== 'GET' && performGraphQLQuery.value}
              >
                <el-form-item prop="options.query" label="GraphQL Query to Execute">
                  <div class="create-webhook__graphql-editor">
                    <textarea v-model={webhook.value.options.query} ref={textarea} />
                  </div>
                </el-form-item>
              </RenderIfComponent>
            </el-form>
          </div>
        </>
      );
    };
  },
});

export default CreateWebhookPage;
