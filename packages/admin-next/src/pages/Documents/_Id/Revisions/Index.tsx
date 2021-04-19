import { Portal } from 'portal-vue';
import { computed, defineComponent, ref } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { DocumentRevision } from '@dockite/database';

import { DocumentRevisionTableColumnDefaultScopedSlot } from './types';

import { getDocumentById } from '~/common/api';
import { getRevisionsForDocumentWithPagination } from '~/common/api/documentRevisions';
import {
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_PORTAL_FOOTER,
  DASHBOARD_MAIN_PORTAL_HEADER,
  DOCKITE_PAGINATION_PER_PAGE,
  DOCKITE_PAGINGATION_PAGE,
} from '~/common/constants';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { useState } from '~/hooks';
import { getDocumentIdentifier, getPaginationString } from '~/utils';

export const DocumentRevisionsPage = defineComponent({
  name: 'DocumentRevisionsPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const state = useState();

    const source = ref('current');

    const against = ref('');

    const page = computed(() => {
      if (route.query.page && typeof route.query.page === 'string') {
        const parsed = Number(route.query.page);

        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }

      return DOCKITE_PAGINGATION_PAGE;
    });

    const document = usePromise(() =>
      getDocumentById({
        id: route.params.documentId as string,
        locale: state.locale.id,
      }),
    );

    const documentRevisions = usePromise(() =>
      getRevisionsForDocumentWithPagination(
        route.params.documentId as string,
        page.value,
        DOCKITE_PAGINATION_PER_PAGE,
      ),
    );

    const revisions = computed<DocumentRevision[]>(() => {
      if (!document.result.value || !documentRevisions.result.value) {
        return [];
      }

      return [
        {
          id: 'current',
          data: document.result.value.data,
          updatedAt: document.result.value.updatedAt,
          createdAt: document.result.value.updatedAt,
          userId: document.result.value.userId,
          schemaId: document.result.value.schemaId,
          documentId: document.result.value.id,
          document: document.result.value,
        },
        ...documentRevisions.result.value.results,
      ];
    });

    const handleUpdatePage = (newPage: number): void => {
      router.push({ query: { page: newPage } }).then(() => {
        documentRevisions.exec();
      });
    };

    return () => {
      if (documentRevisions.error.value || document.error.value) {
        return <div>An error occurred while fetching revisions for the current document</div>;
      }

      return (
        <>
          <RenderIfComponent condition={documentRevisions.loading.value || document.loading.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              Fetching revisions for current document
            </Portal>
          </RenderIfComponent>

          <RenderIfComponent
            condition={documentRevisions.result.value !== null && document.result.value !== null}
          >
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              Revisions for{' '}
              {document.result.value &&
                getDocumentIdentifier(document.result.value.data, document.result.value)}
            </Portal>
          </RenderIfComponent>

          <Portal to={DASHBOARD_MAIN_PORTAL_HEADER}>
            <div class="mb-3 py-3 px-5 rounded bg-white text-sm">
              <div class="flex items-center justify-between -mx-3">
                <div class="px-3 flex">
                  <div class="pr-3">
                    <strong class="block">Source</strong>

                    <span class="block">{source.value || 'No revision selected'}</span>
                  </div>

                  <el-button
                    type="text"
                    icon="el-icon-remove-outline"
                    disabled={source.value === ''}
                    onClick={() => {
                      source.value = '';
                    }}
                  />
                </div>

                <div class="px-3 text-right flex flex-row-reverse">
                  <div class="pl-3">
                    <strong class="block">Against</strong>

                    <span class="block">{against.value || 'No revision selected'}</span>
                  </div>

                  <el-button
                    type="text"
                    icon="el-icon-remove-outline"
                    title="Clear Selection"
                    disabled={against.value === ''}
                    onClick={() => {
                      against.value = '';
                    }}
                  />
                </div>
              </div>
            </div>
          </Portal>

          <div>
            <el-table data={revisions.value}>
              <el-table-column prop="id" label="ID">
                {{
                  default: ({ row }: DocumentRevisionTableColumnDefaultScopedSlot) => (
                    <span class="font-mono truncate">{row.id}</span>
                  ),
                }}
              </el-table-column>

              <el-table-column prop="user.email" label="Triggered By" />

              <el-table-column prop="createdAt" label="Created On">
                {{
                  default: ({ row }: DocumentRevisionTableColumnDefaultScopedSlot) =>
                    new Date(row.createdAt).toLocaleString(),
                }}
              </el-table-column>

              <el-table-column prop="id" label="Source">
                {{
                  default: ({ row, $index }: DocumentRevisionTableColumnDefaultScopedSlot) =>
                    $index !== revisions.value.length - 1 && (
                      <el-radio v-model={source.value} label={row.id}>
                        {''}
                      </el-radio>
                    ),
                }}
              </el-table-column>

              <el-table-column prop="id" label="Against">
                {{
                  default: ({ row }: DocumentRevisionTableColumnDefaultScopedSlot) =>
                    // Disallow using current as an against value
                    row.id !== 'current' && (
                      <el-radio v-model={against.value} label={row.id}>
                        {''}
                      </el-radio>
                    ),
                }}
              </el-table-column>

              <el-table-column prop="id" label="Actions" />
            </el-table>

            <div class="flex items-center justify-between pt-3">
              <span class="text-sm">
                {documentRevisions.result.value &&
                  getPaginationString(documentRevisions.result.value)}
              </span>

              <el-pagination
                currentPage={page.value}
                pageSize={DOCKITE_PAGINATION_PER_PAGE}
                layout="prev, pager, next"
                pageCount={documentRevisions.result.value?.totalPages || 0}
                onCurrentChange={handleUpdatePage}
              />
            </div>
          </div>

          <Portal to={DASHBOARD_MAIN_PORTAL_FOOTER}>
            <div class="flex flex-row-reverse items-center justify-between pt-3">
              <router-link
                to={{
                  path: `/documents/${route.params.documentId}/compare`,
                  query: { source: source.value, against: against.value },
                }}
              >
                <el-button type="primary" disabled={!source.value || !against.value}>
                  Compare Revisions
                </el-button>
              </router-link>
            </div>
          </Portal>
        </>
      );
    };
  },
});

export default DocumentRevisionsPage;
