import { Portal } from 'portal-vue';
import { computed, defineComponent } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { WebhookTableColumnDefaultScopedSlot } from './types';

import { fetchAllWebhooksWithPagination } from '~/common/api/webhooks';
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
              <el-table-column prop="id" label="ID">
                {{
                  default: ({ row }: WebhookTableColumnDefaultScopedSlot) => (
                    <span class="font-mono truncate">{row.id}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column prop="name" label="Name" />

              <el-table-column prop="method" label="Method" />

              <el-table-column prop="createdAt" label="Created At" />

              <el-table-column prop="updatedAt" label="Updated At" />
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
