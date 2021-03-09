import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { fetchDocumentsBySchemaIdWithPagination, getSchemaById, restoreSchema } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { SpinnerComponent } from '~/components/Common/Spinner';

export const RestoreSchemaPage = defineComponent({
  name: 'RestoreSchemaPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const delay = ref(3);

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

    const handleDecrementDelay = (): void => {
      if (delay.value > 0) {
        setTimeout(() => {
          delay.value -= 1;

          handleDecrementDelay();
        }, 1000);
      }
    };

    const handleRestoreSchema = usePromiseLazy(async () => {
      try {
        if (schemaId.value && deletedSchema.result.value) {
          const result = await restoreSchema(deletedSchema.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to restore provided Schema with ID: ${schemaId.value}`,
              ApplicationErrorCode.CANT_RESTORE_SCHEMA,
            );
          }

          ElMessage.success('Schema was restored successfully!');

          router.push('/schemas');
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
          handleDecrementDelay();
        }
      },
    );

    return () => {
      return (
        <div v-loading={handleRestoreSchema.loading.value} class="relative">
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
              <span>Confirmation of <u>{deletedSchema.result.value?.title}</u> Restoration</span>
            </Portal>

            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to restore {deletedSchema.result.value?.title}?
              </h2>

              <p class="pb-5">
                If you restore {deletedSchema.result.value?.title}, the{' '}
                {allDocumentsForSchema.result.value?.totalItems} document(s) associated with the
                Schema will also be restored!
              </p>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={delay.value > 0 || handleRestoreSchema.loading.value}
                  onClick={() => handleRestoreSchema.exec()}
                >
                  {delay.value > 0
                    ? `Available in ${delay.value} seconds...`
                    : `Restore ${deletedSchema.result.value?.title}`}
                </el-button>
              </div>
            </div>
          </RenderIfComponent>
        </div>
      );
    };
  },
});

export default RestoreSchemaPage;
