import { Portal } from 'portal-vue';
import { computed, defineComponent, ref, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { WebhookCall } from '@dockite/database';

import { WebhookCallsTableColumnDefaultScopedSlot } from './types';

import { fetchAllWebhookCallsForWebhookWithPagination, getWebhookById } from '~/common/api';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DOCKITE_PAGINATION_PER_PAGE,
  DOCKITE_PAGINGATION_PAGE,
} from '~/common/constants';
import JsonEditorComponent from '~/components/JsonEditor';
import { getPaginationString, stableJSONStringify } from '~/utils';

export const WebhookCallsPage = defineComponent({
  name: 'WebhookCallsPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const webhookCall = ref<WebhookCall | null>(null);

    const showWebhookCallDialog = ref(false);

    const page = computed(() => {
      if (route.query.page && typeof route.query.page === 'string') {
        const parsed = Number(route.query.page);

        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }

      return DOCKITE_PAGINGATION_PAGE;
    });

    const webhook = usePromise(() => getWebhookById(route.params.webhookId as string));

    const webhookCalls = usePromise(() =>
      fetchAllWebhookCallsForWebhookWithPagination(route.params.webhookId as string),
    );

    const webhookCallsResults = computed(() => {
      console.log(webhookCalls.result.value);
      if (webhookCalls.result.value) {
        return webhookCalls.result.value.results;
      }

      return [];
    });

    const handleUpdatePage = (newPage: number): void => {
      router.push({ query: { page: newPage } }).then(() => {
        webhookCalls.exec();
      });
    };

    const showWebhookCall = (webhookCallData: WebhookCall): void => {
      webhookCall.value = webhookCallData;

      showWebhookCallDialog.value = true;
    };

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
            Webhook Calls for {webhook.result.value?.name ?? 'Unknown'}
          </Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <router-link
              v-loading={webhook.loading.value}
              to={`/settings/webhooks/${webhook.result.value?.id}/edit`}
            >
              <el-button>Edit Webhook</el-button>
            </router-link>
          </Portal>

          <div v-loading={webhookCalls.loading.value}>
            <el-table data={webhookCallsResults.value}>
              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: WebhookCallsTableColumnDefaultScopedSlot) => (
                    <span class="truncate" title={row.id}>
                      {row.id}
                    </span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Success" prop="success">
                {{
                  default: ({ row }: WebhookCallsTableColumnDefaultScopedSlot) =>
                    row.success ? 'Yes' : 'No',
                }}
              </el-table-column>

              <el-table-column label="Status" prop="status" />

              <el-table-column label="Executed" prop="executedAt">
                {{
                  default: ({ row }: WebhookCallsTableColumnDefaultScopedSlot) =>
                    new Date(row.executedAt).toLocaleString(),
                }}
              </el-table-column>

              <el-table-column label="Actions">
                {{
                  default: ({ row }: WebhookCallsTableColumnDefaultScopedSlot) => (
                    <div class="flex items-center -mx-2">
                      <div class="px-2">
                        <a
                          href="#"
                          onClick={withModifiers(() => showWebhookCall(row), ['prevent'])}
                          title="View Webhook Call"
                        >
                          <i class="el-icon-view" />
                        </a>
                      </div>
                    </div>
                  ),
                }}
              </el-table-column>
            </el-table>

            <div class="flex items-center justify-between pt-3">
              <span class="text-sm">
                {webhookCalls.result.value && getPaginationString(webhookCalls.result.value)}
              </span>

              <el-pagination
                currentPage={page.value}
                pageSize={DOCKITE_PAGINATION_PER_PAGE}
                layout="prev, pager, next"
                pageCount={webhookCalls.result.value?.totalPages || 0}
                onCurrentChange={handleUpdatePage}
              />
            </div>

            <el-dialog
              v-model={showWebhookCallDialog.value}
              title="Webhook Call Data"
              customClass="w-full max-w-screen-xl"
            >
              {{
                default: () => (
                  <JsonEditorComponent
                    modelValue={stableJSONStringify(webhookCall.value, 2)}
                    minHeight="60vh"
                    readonly
                  />
                ),
              }}
            </el-dialog>
          </div>
        </>
      );
    };
  },
});

export default WebhookCallsPage;
