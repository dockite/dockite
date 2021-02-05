import { defineComponent, ref, watchEffect } from 'vue';
import { usePromise } from 'vue-composable';
import { useRouter } from 'vue-router';

import { Singleton } from '@dockite/database';

import { getActions } from './util';

import { fetchAllSingletons } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL, MAX_32_BIT_INT } from '~/common/constants';
import { useGraphQL, usePortal } from '~/hooks';

export interface SingletonTableColumnDefaultScopedSlot {
  $index: number;
  row: Singleton;
  column: any;
}

export type SingletonsIndexPageProps = never;

export const SingletonsIndexPage = defineComponent<SingletonsIndexPageProps>(() => {
  const router = useRouter();

  const { exceptionHandler } = useGraphQL();

  const { setPortal } = usePortal();

  const error = ref<Error | null>(null);

  const singletons = usePromise(() => {
    return fetchAllSingletons(MAX_32_BIT_INT);
  });

  watchEffect(() => {
    if (singletons.loading.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Fetching Singletons...</span>);
    }

    if (singletons.error.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Error fetching Singletons!</span>);

      error.value = exceptionHandler(singletons.error.value, router);
    }

    if (singletons.result.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>All Singletons</span>);
    }
  });

  return () => {
    if (singletons.loading.value) {
      return <div>Loading...</div>;
    }

    if (singletons.error.value) {
      return (
        <div>
          An error occurred while fetching the Singletons
          <pre>{JSON.stringify(error.value, null, 2)}</pre>
        </div>
      );
    }

    if (!singletons.result.value) {
      return <div>An unknown error is ocurring</div>;
    }

    return (
      <div class="-m-5">
        <el-table style="width: 100%;" class="w-full" data={singletons.result.value}>
          <el-table-column label="ID" prop="id">
            {{
              default: ({ row }: SingletonTableColumnDefaultScopedSlot) => (
                <router-link
                  class="font-mono overflow-ellipsis whitespace-no-wrap break-normal"
                  to={`/singletons/${row.id}`}
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

          <el-table-column label="Actions" width="120">
            {{
              default: ({ row }: SingletonTableColumnDefaultScopedSlot) => getActions(row),
            }}
          </el-table-column>
        </el-table>
      </div>
    );
  };
});

export default SingletonsIndexPage;
