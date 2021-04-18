import { Portal } from 'portal-vue';
import { defineComponent, ref, watchEffect } from 'vue';
import { usePromise } from 'vue-composable';
import { useRouter } from 'vue-router';

import { Singleton } from '@dockite/database';

import { getTableActions } from './util';

import { fetchAllSingletons } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE, MAX_32_BIT_INT } from '~/common/constants';
import { useGraphQL } from '~/hooks';

export interface SingletonTableColumnDefaultScopedSlot {
  $index: number;
  row: Singleton;
  column: any;
}

export const DeletedSingletonsIndexPage = defineComponent({
  name: 'DeletedSingletonsIndexPageComponent',

  setup: () => {
    const router = useRouter();

    const { exceptionHandler } = useGraphQL();

    const error = ref<Error | null>(null);

    const deletedSingletons = usePromise(() => {
      return fetchAllSingletons(MAX_32_BIT_INT, true);
    });

    watchEffect(() => {
      if (deletedSingletons.error.value) {
        error.value = exceptionHandler(deletedSingletons.error.value, router);
      }
    });

    return () => {
      if (deletedSingletons.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Singletons...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (deletedSingletons.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Singletons!</Portal>

            <div>
              An error occurred while fetching the Deleted Singletons
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (!deletedSingletons.result.value) {
        return <div>An unknown error is ocurring</div>;
      }

      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>All Deleted Singletons</Portal>

          <div class="-m-5">
            <el-table style="width: 100%;" class="w-full" data={deletedSingletons.result.value}>
              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: SingletonTableColumnDefaultScopedSlot) => (
                    <router-link
                      class="font-mono truncate"
                      to={`/singletons/deleted/${row.id}/restore`}
                    >
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Name" prop="title" />

              <el-table-column label="Created" prop="createdAt" width="150">
                {{
                  default: ({ row }: SingletonTableColumnDefaultScopedSlot) => (
                    <span>{new Date(row.createdAt).toLocaleString()}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Updated" prop="updatedAt" width="150">
                {{
                  default: ({ row }: SingletonTableColumnDefaultScopedSlot) => (
                    <span>{new Date(row.updatedAt).toLocaleString()}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Deleted" prop="deletedAt" width="150">
                {{
                  default: ({ row }: SingletonTableColumnDefaultScopedSlot) => (
                    <span>{row.deletedAt ? new Date(row.deletedAt).toLocaleString() : 'N/A'}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Actions" width="120">
                {{
                  default: ({ row }: SingletonTableColumnDefaultScopedSlot) => getTableActions(row),
                }}
              </el-table-column>
            </el-table>
          </div>
        </>
      );
    };
  },
});

export default DeletedSingletonsIndexPage;
