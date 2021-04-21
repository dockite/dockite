import CodeMirror from 'codemirror';
import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash';
import { Portal } from 'portal-vue';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Webhook } from '@dockite/database';

import { editWebhookFormRules } from './formRules';

import { fetchAllSchemas, fetchAllSingletons } from '~/common/api';
import { getWebhookById, updateWebhook } from '~/common/api/webhook';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  MAX_32_BIT_INT,
} from '~/common/constants';
import { logE } from '~/common/logger';
import { FieldErrorList } from '~/common/types';
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

export const EditWebhookPage = defineComponent({
  name: 'EditWebhookPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const webhook = usePromise(() => getWebhookById(route.params.webhookId as string));

    const webhookForm = ref<Omit<Webhook, 'createdAt' | 'updatedAt' | 'calls'>>({
      id: '',
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

    const applyWebhookConstraints = ref(false);

    const textareaEl = ref<HTMLTextAreaElement | null>(null);

    const formEl = ref<any | null>(null);

    const editor = ref<CodeMirror.Editor | null>(null);

    const schemas = usePromise(() => fetchAllSchemas(MAX_32_BIT_INT));

    const singletons = usePromise(() => fetchAllSingletons(MAX_32_BIT_INT));

    const handleEditWebhook = usePromiseLazy(async () => {
      try {
        if (!formEl.value || !webhook.result.value) {
          return;
        }

        const valid = await formEl.value.validate().catch((e: FieldErrorList) => e);

        if (valid !== true) {
          displayClientValidationErrors(valid);

          return;
        }

        await updateWebhook({ ...webhook.result.value, ...webhookForm.value });

        ElMessage.success('Webhook updated successfully!');

        router.push(`/settings/webhooks`);
      } catch (err) {
        logE(err);

        ElMessage.error(
          'An error occurred while attempting to edit the webhook, please try again shortly.',
        );
      }
    });

    const availableListeners = computed(() =>
      getAvailableWebhookListeners(schemas.result.value || [], singletons.result.value || []),
    );

    watch(webhook.result, value => {
      if (value) {
        if (value.options.query && value.method !== 'GET') {
          performGraphQLQuery.value = true;
        }

        if (Array.isArray(value.options.constraints) && value.options.constraints.length > 0) {
          applyWebhookConstraints.value = true;
        }

        Object.assign(webhookForm.value, cloneDeep(value));
      }
    });

    watch(performGraphQLQuery, value => {
      if (value) {
        // We wait for the next tick so textarea may mount since it's v-if'd
        nextTick(() => {
          if (textareaEl.value) {
            editor.value = CodeMirror.fromTextArea(textareaEl.value, {
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
              if (webhookForm.value.options) {
                webhookForm.value.options.query = cm.getValue();
              }
            });
          }
        });
      }

      if (!value && webhookForm.value.method !== 'GET') {
        webhookForm.value.options.query = '';
      }
    });

    watch(applyWebhookConstraints, value => {
      if (!value) {
        webhookForm.value.options.constraints = [];
      }
    });

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
            Edit {webhook.result.value?.name ?? 'Webhook'}
          </Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <el-button
              type="primary"
              onClick={handleEditWebhook.exec}
              disabled={handleEditWebhook.loading.value || webhook.loading.value}
            >
              Edit Webhook
            </el-button>
          </Portal>

          <div
            v-loading={
              handleEditWebhook.loading.value ||
              webhook.loading.value ||
              schemas.loading.value ||
              singletons.loading.value
            }
          >
            <el-form
              ref={formEl}
              labelPosition="top"
              model={webhookForm.value}
              rules={editWebhookFormRules}
            >
              <el-form-item prop="name" label="Name">
                <el-input v-model={webhookForm.value.name} />
              </el-form-item>

              <el-form-item prop="method" label="Method">
                <el-select v-model={webhookForm.value.method}>
                  <el-option label="GET" value="GET" />
                  <el-option label="POST" value="POST" />
                  <el-option label="PUT" value="PUT" />
                  <el-option label="PATCH" value="PATCH" />
                  <el-option label="DELETE" value="DELETE" />
                </el-select>
              </el-form-item>

              <el-form-item prop="url" label="URL">
                <el-input v-model={webhookForm.value.url} />
              </el-form-item>

              <el-form-item prop="options.listeners" label="Listen To">
                {/* This has to be key'd since it doesn't handle changes to the computed property well? */}
                <el-select
                  class="w-full"
                  v-model={webhookForm.value.options.listeners}
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
                  <WebhookConstraintBuilderComponent
                    v-model={webhookForm.value.options.constraints}
                  />
                </el-form-item>
              </RenderIfComponent>

              <RenderIfComponent condition={webhookForm.value.method !== 'GET'}>
                <el-form-item label="Perform GraphQL Query?">
                  <el-switch v-model={performGraphQLQuery.value} />
                </el-form-item>
              </RenderIfComponent>

              <RenderIfComponent
                condition={webhookForm.value.method !== 'GET' && performGraphQLQuery.value}
              >
                <el-form-item prop="options.query" label="GraphQL Query to Execute">
                  <div class="edit-webhook__graphql-editor">
                    <textarea v-model={webhookForm.value.options.query} ref={textareaEl} />
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

export default EditWebhookPage;
