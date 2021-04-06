import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, watch, watchEffect } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import {
  fetchDocumentsBySchemaIdWithPagination,
  getSchemaById,
  permanentlyDeleteSchema,
} from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { useCountdownLazy } from '~/hooks';

export const PermanentDeleteSchemaPage = defineComponent({
  name: 'PermanentDeleteSchemaPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const schemaId = computed(() => {
      if (route.params.schemaId && typeof route.params.schemaId === 'string') {
        return route.params.schemaId;
      }

      return null;
    });

    const allDocumentsForSchema = usePromiseLazy(() => {
      if (schemaId.value) {
        return fetchDocumentsBySchemaIdWithPagination({ schemaId: schemaId.value }, true);
      }

      return Promise.reject(new Error('A valid schemaId is required'));
    });

    const deletedSchema = usePromiseLazy(() => {
      if (schemaId.value) {
        return getSchemaById(schemaId.value, true);
      }

      return Promise.reject(new Error('A valid schemaId is required'));
    });

    const { counterInSeconds, startCountdown } = useCountdownLazy(3000);

    const handlePermanentDeleteSchema = usePromiseLazy(async () => {
      try {
        if (schemaId.value && deletedSchema.result.value) {
          const result = await permanentlyDeleteSchema(deletedSchema.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to permanently delete provided Schema with ID: ${schemaId.value}`,
              ApplicationErrorCode.CANT_PERMANENT_DELETE_SCHEMA,
            );
          }

          ElMessage.success('Schema was permanently deleted!');

          router.push('/schemas/deleted');
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
      if (schemaId.value) {
        // If the schema isn't already loading and we don't already have a value for it
        if (!deletedSchema.loading.value && !deletedSchema.result.value) {
          deletedSchema.exec();
          allDocumentsForSchema.exec();
        }

        // If we have a value for the schema but it's not the same as the route param
        if (deletedSchema.result.value && deletedSchema.result.value.id !== schemaId.value) {
          deletedSchema.exec();
          allDocumentsForSchema.exec();
        }
      }
    });

    watch(
      () => deletedSchema.result.value,
      value => {
        if (value) {
          startCountdown();
        }
      },
    );

    return () => {
      return (
        <div v-loading={handlePermanentDeleteSchema.loading.value} class="relative">
          <RenderIfComponent condition={!schemaId.value || deletedSchema.loading.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Schema...</Portal>

            <div style={{ minHeight: '40vh' }}>
              <div class="el-loading-mask">
                <div class="el-loading-spinner">
                  <SpinnerComponent />

                  <p class="el-loading-text">Schema is still loading, please wait...</p>
                </div>
              </div>
            </div>
          </RenderIfComponent>

          <RenderIfComponent condition={!!deletedSchema.error.value}>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Schema!</Portal>

            <div>An error occurred while fetching the Schema, please try again later.</div>
          </RenderIfComponent>

          <RenderIfComponent
            condition={
              deletedSchema.result.value !== null && allDocumentsForSchema.result.value !== null
            }
          >
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              <span>
                Confirmation of <u>{deletedSchema.result.value?.title}</u> Permanent Deletion
              </span>
            </Portal>

            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to permanently delete {deletedSchema.result.value?.title}?
              </h2>

              <p class="pb-5">
                If you permanently delete {deletedSchema.result.value?.title}, the{' '}
                {allDocumentsForSchema.result.value?.totalItems} document(s) associated with the
                Schema will also be permanently deleted!
              </p>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={counterInSeconds.value > 0 || handlePermanentDeleteSchema.loading.value}
                  onClick={() => handlePermanentDeleteSchema.exec()}
                >
                  {counterInSeconds.value > 0
                    ? `Available in ${counterInSeconds.value} seconds...`
                    : `Permanently Delete ${deletedSchema.result.value?.title}`}
                </el-button>
              </div>
            </div>
          </RenderIfComponent>
        </div>
      );
    };
  },
});

export default PermanentDeleteSchemaPage;
