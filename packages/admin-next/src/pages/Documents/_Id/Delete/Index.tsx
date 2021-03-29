import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getDocumentById } from '~/common/api';
import { deleteDocument } from '~/common/api/document';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { useState } from '~/hooks';
import { getDocumentIdentifier } from '~/utils';

export const DeleteDocumentPage = defineComponent({
  name: 'DeleteDocumentPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const state = useState();

    const delay = ref(3);

    const documentId = computed(() => route.params.documentId as string);

    const document = usePromise(() =>
      getDocumentById({ id: documentId.value, locale: state.locale.id ?? 'en-AU' }),
    );

    const handleDeleteDocument = usePromiseLazy(async () => {
      try {
        if (documentId.value && document.result.value) {
          const result = await deleteDocument(document.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to delete provided Document with ID: ${documentId.value}`,
              ApplicationErrorCode.CANT_DELETE_SCHEMA,
            );
          }

          ElMessage.success('Document deleted successfully!');

          router.push(`/schemas/${document.result.value.schemaId}`);
        }
      } catch (err) {
        logE(err);

        if (err instanceof ApplicationError) {
          throw err;
        }

        throw new ApplicationError(
          'An unknown error occurred, please try again later.',
          ApplicationErrorCode.UNKNOWN_ERROR,
        );
      }
    });

    const documentIdentifier = computed(() => {
      if (document.result.value) {
        return getDocumentIdentifier(document.result.value.data, document.result.value);
      }

      return 'N/A';
    });

    const handleDecrementDelay = (): void => {
      if (delay.value > 0) {
        setTimeout(() => {
          delay.value -= 1;

          handleDecrementDelay();
        }, 1000);
      }
    };

    watch(
      () => document.result.value,
      value => {
        if (value) {
          handleDecrementDelay();
        }
      },
    );

    return () => {
      if (document.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Document...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (document.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Document!</Portal>

            <div>
              An error occurred while fetching the document
              <pre>{document.error.value}</pre>
            </div>
          </>
        );
      }

      if (document.result.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              <span>
                Confirmation of <u title={documentIdentifier.value}>{documentIdentifier.value}</u>{' '}
                Deletion
              </span>
            </Portal>

            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to delete {documentIdentifier.value}?
              </h2>

              <p class="pb-5">
                If you delete {documentIdentifier.value}? You may recover it later if desired by
                viewing the deleted document and restoring it.
              </p>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={delay.value > 0 || handleDeleteDocument.loading.value}
                  onClick={() => handleDeleteDocument.exec()}
                >
                  <span
                    class={{ 'block truncate': delay.value === 0 }}
                    style={{ maxWidth: '150px' }}
                  >
                    {delay.value > 0
                      ? `Available in ${delay.value} seconds...`
                      : `Delete ${documentIdentifier.value}`}
                  </span>
                </el-button>
              </div>
            </div>
          </>
        );
      }

      return <div>An unknown error is occurring!</div>;
    };
  },
});

export default DeleteDocumentPage;
