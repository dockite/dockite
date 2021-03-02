import { defineComponent, computed, watch, watchEffect } from 'vue';
import { usePromiseLazy, usePromise } from 'vue-composable';
import { useRoute } from 'vue-router';

import { getSchemaById, deleteSchema, fetchAllSchemasWithPagination } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { logE } from '~/common/logger';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { usePortal } from '~/hooks';

export const DeleteSchemaPage = defineComponent({
  name: 'DeleteSchemaPage',

  setup: () => {
    const route = useRoute();
    const { setPortal } = usePortal();

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

    watchEffect(() => {
      if (schemaId.value) {
        // If the schema isn't already loading and we don't already have a value for it
        if (!schema.loading.value && !schema.result.value) {
          schema.exec();
        }

        // If we have a value for the schema but it's not the same as the route param
        if (schema.result.value && schema.result.value.id !== schemaId.value) {
          schema.exec();
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
            Delete Schema: <strong class="font-semibold">{schema.result.value.title}</strong>
          </span>,
        );
      }
    });

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
