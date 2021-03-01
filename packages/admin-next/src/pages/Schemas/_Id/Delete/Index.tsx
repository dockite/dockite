import { defineComponent, computed, watch } from 'vue';
import { usePromiseLazy, usePromise } from 'vue-composable';
import { useRoute } from 'vue-router';

import { getSchemaById, deleteSchema, fetchAllSchemasWithPagination } from '~/common/api';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import SpinnerComponent from '~/components/Common/Spinner';

export const DeleteSchemaPage = defineComponent({
  name: 'DeleteSchemaPage',

  setup: () => {
    const route = useRoute();

    const schemaId = computed(() => {
      if (route.params.schemaId && typeof route.params.schemaId === 'string') {
        return route.params.schemaId;
      }

      return null;
    });

    const allSchemas = usePromise(() => fetchAllSchemasWithPagination(1));

    const schema = usePromiseLazy(() => {
      if (schemaId.value) {
        return getSchemaById(schemaId.value);
      }

      return Promise.reject(new Error('A valid schemaId is required'));
    });

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

    watch(
      schemaId,
      value => {
        if (value) {
          schema.exec();
        }
      },
      { immediate: true },
    );

    return () => {
      if (!schemaId || schema.loading.value || allSchemas.loading.value) {
        return (
          <div style={{ minHeight: '40vh' }}>
            <div class="el-loading-mask">
              <div class="el-loading-spinner">
                <SpinnerComponent />

                <p class="el-loading-text">Schema is still loading, please wait...</p>
              </div>
            </div>
          </div>
        );
      }

      if (!schema.result.value) {
        return (
          <div>
            An unknown error has occurred.
            <pre>{schema.error.value || '?'}</pre>
          </div>
        );
      }

      return (
        <div v-loading={handleDeleteSchema.loading.value}>
          <h3>Deleting Schema: {schema.result.value.title}</h3>
        </div>
      );
    };
  },
});

export default DeleteSchemaPage;
