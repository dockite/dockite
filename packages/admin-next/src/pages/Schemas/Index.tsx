import { Schema } from '@dockite/database';
import { defineComponent, ref, watchEffect } from 'vue';
import { usePromise } from 'vue-composable';
import { useRouter } from 'vue-router';

import { getHeaderActions, getTableActions } from './util';

import { fetchAllSchemas } from '~/common/api';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  MAX_32_BIT_INT,
} from '~/common/constants';
import { useGraphQL, usePortal } from '~/hooks';

export interface SchemaTableColumnDefaultScopedSlot {
  $index: number;
  row: Schema;
  column: any;
}

export const SchemasIndexPage = defineComponent({
  name: 'SchemasIndexPageComponent',

  setup: () => {
    const router = useRouter();

    const { exceptionHandler } = useGraphQL();

    const { setPortal } = usePortal();

    const error = ref<Error | null>(null);

    const schemas = usePromise(() => {
      return fetchAllSchemas(MAX_32_BIT_INT);
    });

    watchEffect(() => {
      if (schemas.loading.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Fetching Schemas...</span>);
      }

      if (schemas.error.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Error fetching Schemas!</span>);

        error.value = exceptionHandler(schemas.error.value, router);
      }

      if (schemas.result.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>All Schemas</span>);
      }
    });

    setPortal(DASHBOARD_HEADER_PORTAL_ACTIONS, getHeaderActions());

    return () => {
      if (schemas.loading.value) {
        return <div>Loading...</div>;
      }

      if (schemas.error.value) {
        return (
          <div>
            An error occurred while fetching the Schemas
            <pre>{JSON.stringify(error.value, null, 2)}</pre>
          </div>
        );
      }

      if (!schemas.result.value) {
        return <div>An unknown error is ocurring</div>;
      }

      return (
        <div class="-m-5">
          <el-table style="width: 100%;" class="w-full" data={schemas.result.value}>
            <el-table-column label="ID" prop="id">
              {{
                default: ({ row }: SchemaTableColumnDefaultScopedSlot) => (
                  <router-link
                    class="font-mono overflow-ellipsis whitespace-no-wrap break-normal"
                    to={`/schemas/${row.id}`}
                  >
                    {row.id}
                  </router-link>
                ),
              }}
            </el-table-column>

            <el-table-column label="Name" prop="title" />

            <el-table-column label="Created" prop="createdAt" width="150">
              {{
                default: ({ row }: SchemaTableColumnDefaultScopedSlot) => (
                  <span>{new Date(row.createdAt).toLocaleString()}</span>
                ),
              }}
            </el-table-column>

            <el-table-column label="Updated" prop="updatedAt" width="150">
              {{
                default: ({ row }: SchemaTableColumnDefaultScopedSlot) => (
                  <span>{new Date(row.updatedAt).toLocaleString()}</span>
                ),
              }}
            </el-table-column>

            <el-table-column label="Actions" width="120">
              {{
                default: ({ row }: SchemaTableColumnDefaultScopedSlot) => getTableActions(row),
              }}
            </el-table-column>
          </el-table>
        </div>
      );
    };
  },
});

export default SchemasIndexPage;
