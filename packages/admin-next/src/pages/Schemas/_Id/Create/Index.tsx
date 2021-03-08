import { ElMessage } from 'element-plus';
import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getFooter, getHeaderActions } from './util';

import { getSchemaById } from '~/common/api';
import { createDocument } from '~/common/api/document';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_FOOTER_PORTAL,
} from '~/common/constants';
import { ApplicationErrorGroup } from '~/common/errors';
import { BaseDocument, FieldErrorList } from '~/common/types';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { usePortal } from '~/hooks';
import { displayClientValidationErrors, displayServerValidationErrors } from '~/utils';

export const SchemaCreateDocumentPage = defineComponent({
  name: 'SchemaCreateDocumentPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const { setPortal } = usePortal();

    const formData = reactive<Record<string, any>>({});

    const schema = usePromise(() => getSchemaById(route.params.schemaId as string));

    const document = ref<BaseDocument>({
      locale: 'en-AU',
      data: formData,
      schemaId: schema.result.value?.id ?? '',
    });

    const form = ref<any>(null);

    const error = ref<Error | null>(null);

    const formErrors: Record<string, string> = reactive({});

    const handleCreateDocument = usePromiseLazy(async () => {
      try {
        if (schema.result.value && form.value) {
          const valid = await form.value.validate().catch((e: FieldErrorList) => e);

          if (valid !== true) {
            displayClientValidationErrors(valid);

            return;
          }

          const doc = await createDocument(document.value, schema.result.value);

          ElMessage.success('Document created successfully!');

          router.push(`/documents/${doc.id}`);
        }
      } catch (err) {
        if (err instanceof ApplicationErrorGroup) {
          displayServerValidationErrors(err);

          return;
        }

        throw err;
      }
    });

    watchEffect(() => {
      if (schema.loading.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Fetching Schema...</span>);
      }

      if (schema.error.value) {
        setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Failed to fetch Schema!</span>);
      }

      if (schema.result.value) {
        setPortal(
          DASHBOARD_HEADER_PORTAL_TITLE,
          <span>Create document for {schema.result.value.title}</span>,
        );
      }

      if (schema.result.value && document.value.schemaId !== schema.result.value.id) {
        document.value.schemaId = schema.result.value.id;
      }
    });

    setPortal(DASHBOARD_HEADER_PORTAL_ACTIONS, () => getHeaderActions(handleCreateDocument.exec));
    setPortal(DASHBOARD_MAIN_FOOTER_PORTAL, () => getFooter(router));

    return () => {
      if (schema.loading.value) {
        return <div>Loading...</div>;
      }

      if (schema.error.value) {
        return (
          <div>
            An error occurred while fetching the Schema
            <pre>{JSON.stringify(error.value, null, 2)}</pre>
          </div>
        );
      }

      if (schema.result.value) {
        return (
          <DocumentFormComponent
            v-model={formData}
            schema={schema.result.value}
            document={document.value}
            errors={formErrors}
            formRef={form}
          />
        );
      }

      return <div>An unknown error is ocurring</div>;
    };
  },
});

export default SchemaCreateDocumentPage;
