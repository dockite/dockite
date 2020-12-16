import { defineComponent, reactive, ref, toRaw, watch, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Document } from '@dockite/database';
import { AndQuery } from '@dockite/where-builder';

import { getActions } from './util';

import { getSchemaById } from '~/common/api';
import {
  FetchDocumentsBySchemaIdArgs,
  fetchDocumentsBySchemaIdWithPagination,
} from '~/common/api/documents';
import { DASHBOARD_HEADER_PORTAL, DOCKITE_ITEMS_PER_PAGE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { Maybe } from '~/common/types';
import { DocumentTableColumn, DocumentTableComponent } from '~/components/Common/Documents/Table';
import { DocumentTableState } from '~/components/Common/Documents/Table/types';
import { useGraphQL, usePortal } from '~/hooks';
import {
  getPaginationString,
  getAppliedFilters,
  getAppliedSort,
  getFiltersFromTableState,
  transformFiltersToQueryParam,
} from '~/utils';

export const SchemaDocumentsPage = defineComponent(() => {
  const route = useRoute();

  const router = useRouter();

  const { exceptionHandler } = useGraphQL();

  const { setPortal } = usePortal();

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
    perPage: DOCKITE_ITEMS_PER_PAGE,
    sort: tableState.sortBy ?? undefined,
    where: getFiltersFromTableState(tableState.filters),
    deleted: false,
  });

  const schema = usePromise(() => getSchemaById(schemaId.value));

  const documents = usePromiseLazy(() => {
    if (!schema.result.value) {
      throw new ApplicationError(
        "Attempt to retrieve Schema's documents without Schema reference",
        ApplicationErrorCode.INVALID_STATE,
      );
    }

    return fetchDocumentsBySchemaIdWithPagination({
      ...toRaw(fetchState),
      schemaId: schema.result.value.id,
    });
  });

  watchEffect(() => {
    if (route.params.schemaId !== schemaId.value) {
      schemaId.value = route.params.schemaId as string;

      /* Reset our current state stores on route changes */

      Object.assign(tableState, {
        term: '',
        filters: getAppliedFilters(route),
        sortBy: getAppliedSort(route) ?? null,
      });

      Object.assign(fetchState, {
        page: Number(route.query.page as string) || 1,
        perPage: DOCKITE_ITEMS_PER_PAGE,
        sort: tableState.sortBy ?? undefined,
        where: getFiltersFromTableState(tableState.filters),
        deleted: false,
      });

      schema.exec();
    }
  });

  watchEffect(() => {
    if (schema.loading.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Fetching Schema...</span>);
    }

    if (schema.error.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Error fetching Schema!</span>);

      error.value = exceptionHandler(schema.error.value, router);
    }

    if (documents.loading.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Fetching Documents...</span>);
    }

    if (documents.error.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Error fetching Documents!</span>);

      error.value = exceptionHandler(documents.error.value, router);
    }

    if (schema.result.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>{schema.result.value.title}</span>);
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
    () => {
      if (schema.result.value) {
        documents.exec();

        const fieldsToDisplay = schema.result.value.settings.fieldsToDisplay ?? [];

        tableColumns.value = fieldsToDisplay
          .map(f => {
            const field = schema.result.value!.fields.find(x => x.name === f);

            if (!field) {
              return undefined;
            }

            return {
              label: field?.title,
              name: field?.name,
              filterable: true,
            };
          })
          .filter(x => !!x) as DocumentTableColumn[];
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

  const getTableFooter = (): JSX.Element => {
    return (
      <div class="pt-3 flex justify-between items-center w-full">
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
    if (schema.loading.value || documents.loading.value) {
      return <div>Loading...</div>;
    }

    if (schema.error.value) {
      return (
        <div>
          An error occurred while fetching the Schema
          <pre>{JSON.stringify(error.value, null, 2)}</pre>
        </div>
      );
    }

    if (documents.error.value) {
      return (
        <div>
          An error occurred while fetching the Documents
          <pre>{JSON.stringify(error.value, null, 2)}</pre>
        </div>
      );
    }

    if (!schema.result.value || !documents.result.value) {
      return <div>An unknown error is ocurring</div>;
    }

    return (
      <DocumentTableComponent
        class="-m-5"
        showIdentifier={tableColumns.value.length === 0}
        columns={tableColumns.value}
        documents={documents.result.value.results}
        schema={schema.result.value}
        state={tableState}
        getActions={getActions}
        getFooter={getTableFooter}
        selectable
        v-models={[[selectedItems.value, 'selectedItems']]}
      />
    );
  };
});

export default SchemaDocumentsPage;
