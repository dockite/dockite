import { Portal } from 'portal-vue';
import { computed, defineComponent } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { WebhookTableColumnDefaultScopedSlot } from './types';

import { fetchAllWebhooksWithPagination } from '~/common/api/webhook';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DOCKITE_PAGINATION_PER_PAGE,
  DOCKITE_PAGINGATION_PAGE,
} from '~/common/constants';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { getPaginationString } from '~/utils';

export const AllWebhooksPage = defineComponent({
  name: 'AllWebhooksPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const page = computed(() => {
      if (route.query.page && typeof route.query.page === 'string') {
        const parsed = Number(route.query.page);

        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }

      return DOCKITE_PAGINGATION_PAGE;
    });

    const webhooks = usePromise(() =>
      fetchAllWebhooksWithPagination(page.value, DOCKITE_PAGINATION_PER_PAGE),
    );

    const handleUpdatePage = (newPage: number): void => {
      router.push({ query: { page: newPage } }).then(() => {
        webhooks.exec();
      });
    };

    return () => {
      if (webhooks.error.value) {
        return <div>An error occurred while fetching webhooks</div>;
      }

      return (
        <>
          <RenderIfComponent condition={webhooks.loading.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching All Webhooks</Portal>
          </RenderIfComponent>

          <RenderIfComponent condition={webhooks.result.value !== null}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>All Webhooks</Portal>
          </RenderIfComponent>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <router-link to="/settings/webhooks/create">
              <el-button>Create Webhook</el-button>
            </router-link>
          </Portal>

          <div v-loading={webhooks.loading.value}>
            <el-table data={webhooks.result.value?.results ?? []}>
              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: WebhookTableColumnDefaultScopedSlot) => (
                    <router-link to={`/settings/webhooks/${row.id}`} class="font-mono truncate">
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Name" prop="name" />

              <el-table-column label="Method" prop="method" />

              <el-table-column label="Created" prop="createdAt" width="150">
                {{
                  default: ({ row }: WebhookTableColumnDefaultScopedSlot) => (
                    <span>{new Date(row.createdAt).toLocaleString()}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Updated" prop="updatedAt" width="150">
                {{
                  default: ({ row }: WebhookTableColumnDefaultScopedSlot) => (
                    <span>{new Date(row.updatedAt).toLocaleString()}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Actions">
                {{
                  default: ({ row }: WebhookTableColumnDefaultScopedSlot) => (
                    <div class="flex items-center -mx-2">
                      <div class="px-2">
                        <router-link to={`/settings/webhooks/${row.id}/edit`}>
                          <i class="el-icon-edit-outline" />
                        </router-link>
                      </div>

                      <div class="px-2">
                        <router-link to={`/settings/webhooks/${row.id}/delete`}>
                          <i class="el-icon-delete" />
                        </router-link>
                      </div>
                    </div>
                  ),
                }}
              </el-table-column>
            </el-table>

            <div class="flex items-center justify-between pt-3">
              <span class="text-sm">
                {webhooks.result.value && getPaginationString(webhooks.result.value)}
              </span>

              <el-pagination
                currentPage={page.value}
                pageSize={DOCKITE_PAGINATION_PER_PAGE}
                layout="prev, pager, next"
                pageCount={webhooks.result.value?.totalPages || 0}
                onCurrentChange={handleUpdatePage}
              />
            </div>
          </div>
        </>
      );
    };
  },
});

export default AllWebhooksPage;
