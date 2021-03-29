import { Portal } from 'portal-vue';
import { defineComponent } from 'vue';
import { usePromise } from 'vue-composable';

import { Locale } from '@dockite/database';

import { getHeaderActions, getTableActions } from './util';

import { fetchAllLocales } from '~/common/api/locales';
import { DASHBOARD_HEADER_PORTAL_ACTIONS, DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { LocaleIconComponent } from '~/components/LocaleSelector';

export interface LocaleTableColumnDefaultScopedSlot {
  $index: number;
  row: Locale;
  column: any;
}

export const LocalesIndexPage = defineComponent({
  name: 'LocalesIndexPage',

  setup: () => {
    const locales = usePromise(() => fetchAllLocales());

    return () => {
      if (locales.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Locales...!</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (locales.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>An error while fetching the Locales!</Portal>

            <div>
              An error occurred while fetching the Locales
              {/* <pre>{JSON.stringify(error.value, null, 2)}</pre> */}
            </div>
          </>
        );
      }

      if (!locales.result.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>An unknown error is occurring!</Portal>

            <div>An unknown error is ocurring</div>
          </>
        );
      }

      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>All Locales</Portal>
          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>{getHeaderActions()}</Portal>

          <div class="-m-5">
            <el-table style="width: 100%;" class="w-full" data={locales.result.value}>
              <el-table-column label="ID" prop="id">
                {{
                  default: ({ row }: LocaleTableColumnDefaultScopedSlot) => (
                    <router-link
                      class="font-mono overflow-ellipsis whitespace-no-wrap break-normal"
                      to={`/locales/${row.id}`}
                    >
                      {row.id}
                    </router-link>
                  ),
                }}
              </el-table-column>

              <el-table-column label="Title" prop="title" />

              <el-table-column label="Icon" prop="icon">
                {{
                  default: ({ row }: LocaleTableColumnDefaultScopedSlot) => (
                    <LocaleIconComponent icon={row.icon} />
                  ),
                }}
              </el-table-column>

              <el-table-column label="Actions" width="120">
                {{
                  default: ({ row }: LocaleTableColumnDefaultScopedSlot) => getTableActions(row),
                }}
              </el-table-column>
            </el-table>
          </div>
        </>
      );
    };
  },
});
