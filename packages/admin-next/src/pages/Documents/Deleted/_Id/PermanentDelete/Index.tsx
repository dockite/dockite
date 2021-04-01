import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getDocumentById, permanentlyDeleteDocument } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { useState } from '~/hooks';
import { getDocumentIdentifier } from '~/utils';

export const PermanentDeleteDocumentPage = defineComponent({
  name: 'PermanentDeleteDocumentPage',

  setup: () => {
    const state = useState();

    const route = useRoute();

    const router = useRouter();

    const delay = ref(3);

    const documentId = computed(() => {
      if (route.params.documentId && typeof route.params.documentId === 'string') {
        return route.params.documentId;
      }

      return null;
    });

    const deletedDocument = usePromiseLazy(() => {
      if (documentId.value) {
        return getDocumentById(
          {
            id: documentId.value,
            locale: state.locale.id,
          },
          true,
        );
      }

      return Promise.reject(new Error('A valid documentId is required'));
    });

    const documentIdentifier = computed(() => {
      if (deletedDocument.result.value) {
        return getDocumentIdentifier(
          deletedDocument.result.value.data,
          deletedDocument.result.value,
        );
      }

      return documentId.value;
    });

    const handleDecrementDelay = (): void => {
      if (delay.value > 0) {
        setTimeout(() => {
          delay.value -= 1;

          handleDecrementDelay();
        }, 1000);
      }
    };

    const handlePermanentDeleteDocument = usePromiseLazy(async () => {
      try {
        if (documentId.value && deletedDocument.result.value) {
          const result = await permanentlyDeleteDocument(deletedDocument.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to permanently delete provided Document with ID: ${documentId.value}`,
              ApplicationErrorCode.CANT_PERMANENT_DELETE_SCHEMA,
            );
          }

          ElMessage.success('Document was permanently deleted!');

          router.push('/documents/deleted');
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

    watchEffect(() => {
      if (documentId.value) {
        // If the document isn't already loading and we don't already have a value for it
        if (!deletedDocument.loading.value && !deletedDocument.result.value) {
          deletedDocument.exec();
        }

        // If we have a value for the document but it's not the same as the route param
        if (deletedDocument.result.value && deletedDocument.result.value.id !== documentId.value) {
          deletedDocument.exec();
        }
      }
    });

    watch(
      () => deletedDocument.result.value,
      value => {
        if (value) {
          handleDecrementDelay();
        }
      },
    );

    return () => {
      return (
        <div v-loading={handlePermanentDeleteDocument.loading.value} class="relative">
          <RenderIfComponent condition={!documentId.value || deletedDocument.loading.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Document...</Portal>

            <div style={{ minHeight: '40vh' }}>
              <div class="el-loading-mask">
                <div class="el-loading-spinner">
                  <SpinnerComponent />

                  <p class="el-loading-text">Document is still loading, please wait...</p>
                </div>
              </div>
            </div>
          </RenderIfComponent>

          <RenderIfComponent condition={!!deletedDocument.error.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Document!</Portal>

            <div>An error occurred while fetching the Document, please try again later.</div>
          </RenderIfComponent>

          <RenderIfComponent condition={deletedDocument.result.value !== null}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              <span>
                Confirmation of <u>{documentIdentifier.value}</u> Permanent Deletion
              </span>
            </Portal>

            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to permanently delete {documentIdentifier.value}?
              </h2>

              <p class="pb-5">
                If you permanently delete {documentIdentifier.value}, you will not be able to
                recover it later!
              </p>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={delay.value > 0 || handlePermanentDeleteDocument.loading.value}
                  onClick={() => handlePermanentDeleteDocument.exec()}
                >
                  {delay.value > 0
                    ? `Available in ${delay.value} seconds...`
                    : `Permanently Delete`}
                </el-button>
              </div>
            </div>
          </RenderIfComponent>
        </div>
      );
    };
  },
});

export default PermanentDeleteDocumentPage;
