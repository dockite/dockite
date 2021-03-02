import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getDocumentById, getSchemaById, getSingletonById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { useGraphQL, usePortal } from '~/hooks';
import { getDocumentIdentifier } from '~/utils';

export const DocumentFormPage = defineComponent({
  name: 'DocumentFormPageComponent',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const { setPortal } = usePortal();

    const formData = reactive<Record<string, any>>({});

    const document = usePromise(() => getDocumentById(route.params.documentId as string));

    const schema = usePromiseLazy((id: string) => getSchemaById(id));

    const singleton = usePromiseLazy((id: string) => getSingletonById(id));

    const error = ref<Error | null>(null);

    const formErrors: Record<string, string> = reactive({});

    const { exceptionHandler } = useGraphQL();

    watchEffect(() => {
      if (document.loading.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Fetching Documents...</span>);

        return;
      }

      if (document.error.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Error fetching Documents!</span>);

        error.value = exceptionHandler(document.error.value, router);

        return;
      }

      if (singleton.result.value) {
        router.replace(`/singletons/${singleton.result.value.id}`);

        return;
      }

      if (schema.loading.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Fetching Document's Schema...</span>);

        return;
      }

      if (schema.error.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Error fetching Document's Schema!</span>);

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
        (!schema.result.value || schema.result.value.id !== document.result.value.schemaId)
      ) {
        schema.exec(document.result.value.schemaId);

        return;
      }

      if (document.result.value && schema.result.value) {
        setPortal(
          DASHBOARD_HEADER_PORTAL_TITLE,
          <span>{getDocumentIdentifier(document.result.value)}</span>,
        );
      }
    });

    return () => {
      if (schema.loading.value || document.loading.value) {
        return <div>Loading...</div>;
      }

      if (document.error.value) {
        return (
          <div>
            An error occurred while fetching the Documents
            <pre>{JSON.stringify(error.value, null, 2)}</pre>
          </div>
        );
      }

      if (schema.error.value) {
        return (
          <div>
            An error occurred while fetching the Schema
            <pre>{JSON.stringify(error.value, null, 2)}</pre>
          </div>
        );
      }

      if (document.result.value && schema.result.value) {
        return (
          <DocumentFormComponent
            v-model={formData}
            schema={schema.result.value}
            document={document.result.value}
            errors={formErrors}
          />
        );
      }

      return <div>An unknown error is ocurring</div>;
    };
  },
});

export default DocumentFormPage;
