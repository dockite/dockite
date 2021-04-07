import { Portal } from 'portal-vue';
import { defineComponent, reactive, ref, toRaw, watch, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Document } from '@dockite/database';
import { AndQuery } from '@dockite/where-builder/lib/types';

import { getHeaderActions, getTableActions } from './util';

import { getSchemaById } from '~/common/api';
import {
  FetchDocumentsBySchemaIdArgs,
  fetchDocumentsBySchemaIdWithPagination,
} from '~/common/api/documents';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DOCKITE_PAGINATION_PER_PAGE,
} from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { Maybe } from '~/common/types';
import { DocumentTableColumn, DocumentTableComponent } from '~/components/Common/Document/Table';
import { DocumentTableState } from '~/components/Common/Document/Table/types';
import { useGraphQL, useState } from '~/hooks';
import {
  getAppliedFilters,
  getAppliedSort,
  getColumnsFromQueryParams,
  getFiltersFromTableState,
  getPaginationString,
  transformFiltersToQueryParam,
} from '~/utils';

export const DeletedSchemaDocumentsPage = defineComponent({
  name: 'DeletedSchemaDocumentsPageComponent',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const state = useState();

    const { exceptionHandler } = useGraphQL();

    const error = ref<Error | null>(null);

    const tableColumns = ref<DocumentTableColumn[]>([]);

    const selectedItems = ref<Document[]>([]);

    const schemaId = ref(route.params.schemaId as string);

    const tableState = reactive<DocumentTableState>({
      term: '',
      filters: getAppliedFilters(route),
      sortBy: getAppliedSort(route) ?? null,
    });

    const fetchState = reactive<Omit<FetchDocumentsBySchemaIdArgs, 'schemaId'>>({
      page: Number(route.query.page as string) || 1,
      perPage: DOCKITE_PAGINATION_PER_PAGE,
      sort: tableState.sortBy ?? undefined,
      where: getFiltersFromTableState(tableState.filters),
      locale: state.locale.id,
      deleted: true,
    });

    const schema = usePromise(() => getSchemaById(schemaId.value));

    const documents = usePromiseLazy(() => {
      if (!schema.result.value) {
        throw new ApplicationError(
          "Attempt to retrieve Schema's documents without Schema reference",
          ApplicationErrorCode.INVALID_STATE,
        );
      }

      return fetchDocumentsBySchemaIdWithPagination(
        {
          ...toRaw(fetchState),
          schemaId: schema.result.value.id,
        },
        fetchState.deleted,
      );
    });

    watchEffect(() => {
      if (route.params.schemaId && route.params.schemaId !== schemaId.value) {
        schemaId.value = route.params.schemaId as string;

        /* Reset our current state stores on route changes */
        Object.assign(tableState, {
          term: '',
          filters: getAppliedFilters(route),
          sortBy: getAppliedSort(route) ?? null,
        });

        Object.assign(fetchState, {
          page: Number(route.query.page as string) || 1,
          perPage: DOCKITE_PAGINATION_PER_PAGE,
          sort: tableState.sortBy ?? undefined,
          where: getFiltersFromTableState(tableState.filters),
          deleted: true,
        });

        schema.exec();
      }
    });

    watchEffect(() => {
      if (schema.error.value) {
        error.value = exceptionHandler(schema.error.value, router);
      }

      if (documents.error.value) {
        error.value = exceptionHandler(documents.error.value, router);
      }
    });

    watchEffect(() => {
      if (tableState.filters) {
        fetchState.where = getFiltersFromTableState(tableState.filters);
      }

      if (tableState.sortBy) {
        fetchState.sort = tableState.sortBy ?? undefined;
      }
    });

    watch(
      schema.result,
      value => {
        if (value) {
          documents.exec();

          const fieldsToDisplay = value.settings.fieldsToDisplay ?? [];

          tableColumns.value = [];

          if (route.query.columns) {
            tableColumns.value = getColumnsFromQueryParams(route, value);
          }

          if (tableColumns.value.length === 0) {
            tableColumns.value = fieldsToDisplay
              .map(f => {
                const field = value.fields.find(x => x.name === f);

                if (!field) {
                  return undefined;
                }

                return {
                  label: field.title,
                  name: field.name,
                  filterable: true,
                };
              })
              .filter(x => !!x) as DocumentTableColumn[];
          }
        }
      },
      { immediate: true },
    );

    watch(fetchState, (newState: typeof fetchState) => {
      router.push({
        query: {
          ...route.query,
          page: newState.page,
          filters: transformFiltersToQueryParam(newState.where as Maybe<AndQuery>),
        },
      });

      documents.exec();
    });

    watch(tableColumns, (columns, oldColumns): void => {
      // If we aren't dealing with an initial value we will update the route params
      if (oldColumns.length !== 0) {
        router.push({
          query: {
            ...route.query,
            columns: columns.map(col => col.name),
          },
        });
      }
    });

    const getTableFooter = (): JSX.Element => {
      return (
        <div class="p-3 flex justify-between items-center w-full">
          <span class="text-sm opacity-75">
            {documents.result.value && getPaginationString(documents.result.value)}
          </span>

          <el-pagination
            currentPage={documents.result.value?.currentPage || 1}
            pageSize={DOCKITE_PAGINATION_PER_PAGE}
            layout="prev, pager, next"
            pageCount={documents.result.value?.totalPages || 0}
            onCurrentChange={(newPage: number) => {
              fetchState.page = newPage;
            }}
          />
        </div>
      );
    };

    return () => {
      if (schema.loading.value || documents.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Schema and Documents...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (schema.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Schema!</Portal>

            <div>
              An error occurred while fetching the Schema
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (documents.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Documents for Schema!</Portal>

            <div>
              An error occurred while fetching the Documents
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (!schema.result.value || !documents.result.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>An unknown error is occurring!</Portal>

            <div>An unknown error is ocurring</div>
          </>
        );
      }

      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
            Deleted documents for {schema.result.value.title}
          </Portal>

          <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>{getHeaderActions(schema.result)}</Portal>

          <DocumentTableComponent
            class="-m-5"
            documents={documents.result.value.results}
            getActions={getTableActions}
            getFooter={getTableFooter}
            schema={schema.result.value}
            showIdentifierColumn={tableColumns.value.length === 0}
            state={tableState}
            updatableColumns
            v-models={[
              [selectedItems.value, 'selectedItems'],
              [tableColumns.value, 'columns'],
            ]}
          />
        </>
      );
    };
  },
});

export default DeletedSchemaDocumentsPage;
