import { ElMessage } from 'element-plus';
import { computed, defineComponent, watchEffect, ref, onMounted, watch } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { deleteSchema, fetchDocumentsBySchemaIdWithPagination, getSchemaById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import RenderIfComponent from '~/components/Common/RenderIf';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { usePortal } from '~/hooks';

export const DeleteSchemaPage = defineComponent({
  name: 'DeleteSchemaPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const { setPortal } = usePortal();

    const delay = ref(3);

    const schemaId = computed(() => {
      if (route.params.schemaId && typeof route.params.schemaId === 'string') {
        return route.params.schemaId;
      }

      return null;
    });

    const allDocumentsForSchema = usePromiseLazy(() => {
      if (schemaId.value) {
        return fetchDocumentsBySchemaIdWithPagination({ schemaId: schemaId.value });
      }

      return Promise.reject(new Error('A valid schemaId is required'));
    });

    const schema = usePromiseLazy(() => {
      if (schemaId.value) {
        return getSchemaById(schemaId.value);
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

    const handleDeleteSchema = usePromiseLazy(async () => {
      try {
        if (schemaId.value && schema.result.value) {
          const result = await deleteSchema(schema.result.value);

          if (!result) {
            throw new ApplicationError(
              `Unable to delete provided Schema with ID: ${schemaId.value}`,
              ApplicationErrorCode.CANT_DELETE_SCHEMA,
            );
          }

          ElMessage.success('Schema deleted successfully!');

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
        if (!schema.loading.value && !schema.result.value) {
          schema.exec();
          allDocumentsForSchema.exec();
        }

        // If we have a value for the schema but it's not the same as the route param
        if (schema.result.value && schema.result.value.id !== schemaId.value) {
          schema.exec();
          allDocumentsForSchema.exec();
        }
      }
    });

    watchEffect(() => {
      if (schema.loading.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Loading Schema...</span>);
      }

      if (schema.error.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Failed to fetch Schema!</span>);
      }

      if (schema.result.value) {
        setPortal(
          DASHBOARD_HEADER_PORTAL_TITLE,
          <span>
            Confirmation of <u>{schema.result.value.title}</u> Deletion
          </span>,
        );
      }
    });

    watch(
      () => schema.result.value,
      value => {
        if (value) {
          handleDecrementDelay();
        }
      },
    );

    return () => {
      return (
        <div v-loading={handleDeleteSchema.loading.value} class="relative">
          <RenderIfComponent condition={!schemaId.value || schema.loading.value}>
            <div style={{ minHeight: '40vh' }}>
              <div class="el-loading-mask">
                <div class="el-loading-spinner">
                  <SpinnerComponent />

                  <p class="el-loading-text">Schema is still loading, please wait...</p>
                </div>
              </div>
            </div>
          </RenderIfComponent>

          <RenderIfComponent condition={!!schema.error.value}>
            <div>An error occurred while fetching the Schema, please try again later.</div>
          </RenderIfComponent>

          <RenderIfComponent
            condition={schema.result.value !== null && allDocumentsForSchema.result.value !== null}
          >
            <div>
              <h2 class="text-xl font-semibold pb-5">
                Are you sure you want to delete {schema.result.value?.title}?
              </h2>

              <p class="pb-5">
                If you delete {schema.result.value?.title}, the{' '}
                {allDocumentsForSchema.result.value?.totalItems} document(s) associated with the
                Schema will also be deleted!
              </p>

              <div class="flex justify-between items-center">
                <el-button type="text" onClick={() => router.back()}>
                  Go Back
                </el-button>

                <el-button
                  type="danger"
                  loading={delay.value > 0 || handleDeleteSchema.loading.value}
                  onClick={() => handleDeleteSchema.exec()}
                >
                  {delay.value > 0
                    ? `Available in ${delay.value} seconds...`
                    : `Delete ${schema.result.value?.title}`}
                </el-button>
              </div>
            </div>
          </RenderIfComponent>
        </div>
      );
    };
  },
});

export default DeleteSchemaPage;
