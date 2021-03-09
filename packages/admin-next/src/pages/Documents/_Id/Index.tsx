import { Portal } from 'portal-vue';
import { computed, defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getDocumentById, getSchemaById, getSingletonById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { useGraphQL } from '~/hooks';
import { getDocumentIdentifier } from '~/utils';

export const DocumentFormPage = defineComponent({
  name: 'DocumentFormPageComponent',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const formData = reactive<Record<string, any>>({});

    const document = usePromise(() => getDocumentById(route.params.documentId as string));

    const schema = usePromiseLazy((id: string) => getSchemaById(id));

    const singleton = usePromiseLazy((id: string) => getSingletonById(id));

    const error = ref<Error | null>(null);

    const formErrors: Record<string, string> = reactive({});

    const { exceptionHandler } = useGraphQL();

    watchEffect(() => {
      if (document.error.value) {
        error.value = exceptionHandler(document.error.value, router);

        return;
      }

      if (singleton.result.value) {
        router.replace(`/singletons/${singleton.result.value.id}`);

        return;
      }

      if (schema.error.value) {
        error.value = exceptionHandler(schema.error.value, router);

        if (!singleton.loading.value && document.result.value) {
          singleton.exec(document.result.value.schemaId);
        }

        return;
      }

      if (
        document.result.value &&
        document.result.value.schemaId &&
        !singleton.loading.value &&
        !singleton.result.value &&
        !schema.loading.value &&
        (!schema.result.value || schema.result.value.id !== document.result.value.schemaId)
      ) {
        schema.exec(document.result.value.schemaId);
      }
    });

    return () => {
      if (schema.loading.value || document.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching document data...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (document.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching document!</Portal>

            <div>
              An error occurred while fetching the Documents
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (schema.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Schema for Document!</Portal>

            <div>
              An error occurred while fetching the Schema
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (document.result.value && schema.result.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              <span
                class="truncate"
                style={{ maxWidth: '250px' }}
                title={getDocumentIdentifier(formData, document.result.value)}
              >
                {getDocumentIdentifier(formData, document.result.value)}
              </span>
            </Portal>

            <DocumentFormComponent
              v-model={formData}
              schema={schema.result.value}
              document={document.result.value}
              errors={formErrors}
            />
          </>
        );
      }

      return <div>An unknown error is ocurring</div>;
    };
  },
});

export default DocumentFormPage;
