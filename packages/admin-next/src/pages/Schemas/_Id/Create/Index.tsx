import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getFooter, getHeaderActions } from './util';

import { getSchemaById } from '~/common/api';
import { createDocument } from '~/common/api/document';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_PORTAL_FOOTER,
} from '~/common/constants';
import { ApplicationErrorGroup } from '~/common/errors';
import { BaseDocument, FieldErrorList } from '~/common/types';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { displayClientValidationErrors, displayServerValidationErrors } from '~/utils';

export const SchemaCreateDocumentPage = defineComponent({
  name: 'SchemaCreateDocumentPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

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
      if (schema.result.value && document.value.schemaId !== schema.result.value.id) {
        document.value.schemaId = schema.result.value.id;
      }
    });

    return () => {
      if (schema.loading.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Fetching Schema...</Portal>

            <div>Loading...</div>
          </>
        );
      }

      if (schema.error.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Error fetching Schema!</Portal>

            <div>
              An error occurred while fetching the Schema
              <pre>{JSON.stringify(error.value, null, 2)}</pre>
            </div>
          </>
        );
      }

      if (schema.result.value) {
        return (
          <>
            <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>
              Create document for {schema.result.value.title}
            </Portal>

            <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
              {getHeaderActions(handleCreateDocument.exec)}
            </Portal>

            <DocumentFormComponent
              v-model={formData}
              schema={schema.result.value}
              document={document.value}
              errors={formErrors}
              formRef={form}
            />

            <Portal to={DASHBOARD_MAIN_PORTAL_FOOTER}>{getFooter(router)}</Portal>
          </>
        );
      }

      return <div>An unknown error is ocurring</div>;
    };
  },
});

export default SchemaCreateDocumentPage;
