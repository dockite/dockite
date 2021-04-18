import { Portal } from 'portal-vue';
import { defineComponent, ref, watchEffect } from 'vue';
import { usePromise } from 'vue-composable';
import { useRouter } from 'vue-router';

import { Schema } from '@dockite/database';

import { getTableActions } from './util';

import { fetchAllSchemas } from '~/common/api';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  MAX_32_BIT_INT,
} from '~/common/constants';
import { useGraphQL } from '~/hooks';

export interface SchemaTableColumnDefaultScopedSlot {
  $index: number;
  row: Schema;
  column: any;
}

export const DeletedSchemasIndexPage = defineComponent({
  name: 'DeletedSchemasIndexPageComponent',

  setup: () => {
    const router = useRouter();

    const { exceptionHandler } = useGraphQL();

    const error = ref<Error | null>(null);

    const deletedSchemas = usePromise(() => {
      return fetchAllSchemas(MAX_32_BIT_INT, true);
    });

    watchEffect(() => {
      if (deletedSchemas.error.value) {
        error.value = exceptionHandler(deletedSchemas.error.value, router);
      }
    });

    return () => {
      if (deletedSchemas.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Deleted Schemas...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (deletedSchemas.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Deleted Schemas!</Portal>

            <div>
              An error occurred while fetching the Deleted Schemas
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (!deletedSchemas.result.value) {
        return <div>An unknown error is ocurring</div>;
      }

      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>All Deleted Schemas</Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
            <router-link to="/schemas">
              <el-button>
                <i class="el-icon-back el-icon--left" />
                Back
              </el-button>
            </router-link>
          </Portal>

          <div class="-m-5">
            <el-table style="width: 100%;" class="w-full" data={deletedSchemas.result.value}>
              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: SchemaTableColumnDefaultScopedSlot) => (
                    <router-link
                      class="font-mono truncate"
                      to={`/schemas/deleted/${row.id}/restore`}
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

              <el-table-column label="Deleted" prop="deletedAt" width="150">
                {{
                  default: ({ row }: SchemaTableColumnDefaultScopedSlot) => (
                    <span>{row.deletedAt ? new Date(row.deletedAt).toLocaleString() : 'N/A'}</span>
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
        </>
      );
    };
  },
});

export default DeletedSchemasIndexPage;
