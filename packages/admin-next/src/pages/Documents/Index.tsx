import { defineComponent, reactive, ref, toRaw, watch, watchEffect } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { AndQuery } from '@dockite/where-builder';

import { getActions } from './util';

import { fetchAllDocumentsWithPagination } from '~/common/api/documents';
import { DASHBOARD_HEADER_PORTAL, DOCKITE_ITEMS_PER_PAGE } from '~/common/constants';
import { Maybe } from '~/common/types';
import { DocumentTableColumn, DocumentTableComponent } from '~/components/Common/Documents/Table';
import { DocumentTableState } from '~/components/Common/Documents/Table/types';
import { FetchAllDocumentsQueryVariables } from '~/graphql/queries/fetchAllDocuments';
import { useGraphQL, usePortal } from '~/hooks';
import {
  getPaginationString,
  getAppliedFilters,
  getAppliedSort,
  getFiltersFromTableState,
  transformFiltersToQueryParam,
} from '~/utils';

export const DocumentsIndexPage = defineComponent(() => {
  const route = useRoute();

  const router = useRouter();

  const { exceptionHandler } = useGraphQL();

  const { setPortal } = usePortal();

  const error = ref<Error | null>(null);

  const tableColumns = ref<DocumentTableColumn[]>([]);

  const tableState = reactive<DocumentTableState>({
    term: '',
    filters: getAppliedFilters(route),
    sortBy: getAppliedSort(route) ?? null,
  });

  const fetchState = reactive<FetchAllDocumentsQueryVariables>({
    page: Number(route.query.page as string) || 1,
    perPage: DOCKITE_ITEMS_PER_PAGE,
    sort: tableState.sortBy ?? undefined,
    where: getFiltersFromTableState(tableState.filters),
    deleted: false,
  });

  const documents = usePromise(() => {
    return fetchAllDocumentsWithPagination({
      ...toRaw(fetchState),
    });
  });

  watchEffect(() => {
    if (documents.loading.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Fetching Documents...</span>);
    }

    if (documents.error.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Error fetching Documents!</span>);

      error.value = exceptionHandler(documents.error.value, router);
    }

    if (documents.result.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>All Documents</span>);
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

  const getTableFooter = (): JSX.Element => {
    return (
      <div class="p-3 flex justify-between items-center w-full">
        <span class="text-sm opacity-75">
          {documents.result.value && getPaginationString(documents.result.value)}
        </span>

        <el-pagination
          currentPage={documents.result.value?.currentPage || 1}
          pageSize={DOCKITE_ITEMS_PER_PAGE}
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
    if (documents.loading.value) {
      return <div>Loading...</div>;
    }

    if (documents.error.value) {
      return (
        <div>
          An error occurred while fetching the Documents
          <pre>{JSON.stringify(error.value, null, 2)}</pre>
        </div>
      );
    }

    if (!documents.result.value) {
      return <div>An unknown error is ocurring</div>;
    }

    return (
      <DocumentTableComponent
        class="-m-5"
        columns={tableColumns.value}
        documents={documents.result.value.results}
        getActions={getActions}
        getFooter={getTableFooter}
        state={tableState}
        showIdentifierColumn
        showSchemaColumn
      />
    );
  };
});

export default DocumentsIndexPage;
