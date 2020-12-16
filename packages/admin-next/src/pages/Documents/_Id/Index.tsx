import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getDocumentById, getSchemaById } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL } from '~/common/constants';
import { DocumentFormComponent } from '~/components/Common/Documents/Form';
import { useGraphQL, usePortal } from '~/hooks';
import { getDocumentIdentifier } from '~/utils';

export type DocumentFormPageProps = never;

export const DocumentFormPage = defineComponent<DocumentFormPageProps>(() => {
  const route = useRoute();

  const router = useRouter();

  const { setPortal } = usePortal();

  const formData = reactive<Record<string, any>>({});

  const document = usePromise(() => getDocumentById(route.params.documentId as string));

  const schema = usePromiseLazy((id: string) => getSchemaById(id));

  const error = ref<Error | null>(null);

  const formErrors: Record<string, string> = reactive({});

  const { exceptionHandler } = useGraphQL();

  watchEffect(() => {
    if (document.loading.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Fetching Documents...</span>);

      return;
    }

    if (document.error.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Error fetching Documents!</span>);

      error.value = exceptionHandler(document.error.value, router);

      return;
    }

    if (schema.loading.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Fetching Document's Schema...</span>);

      return;
    }

    if (schema.error.value) {
      setPortal(DASHBOARD_HEADER_PORTAL, <span>Error fetching Document's Schema!</span>);

      error.value = exceptionHandler(schema.error.value, router);

      return;
    }

    if (
      document.result.value &&
      (!schema.result.value || schema.result.value.id !== document.result.value.schemaId)
    ) {
      schema.exec(document.result.value.schemaId);

      return;
    }

    if (document.result.value && schema.result.value) {
      setPortal(
        DASHBOARD_HEADER_PORTAL,
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
        // @ts-expect-error Typescript can't handle v-models
        <DocumentFormComponent
          schema={schema.result.value}
          document={document.result.value}
          errors={formErrors}
          v-model={formData}
        />
      );
    }

    return <div>An unknown error is ocurring</div>;
  };
});
