import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getFooter, getFormFieldIdentifiers, getHeaderActions, validateFields } from './util';

import { getDocumentById, getSchemaById } from '~/common/api';
import { createDocument } from '~/common/api/document';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_PORTAL_FOOTER,
} from '~/common/constants';
import { ApplicationError, ApplicationErrorGroup } from '~/common/errors';
import { FieldErrorList } from '~/common/types';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { useState } from '~/hooks';
import {
  displayClientValidationErrors,
  displayServerValidationErrors,
  isRootLocale,
} from '~/utils';

export const SchemaCreateDocumentPage = defineComponent({
  name: 'SchemaCreateDocumentPage',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const state = useState();

    const formData = ref<Record<string, any>>({});

    const schema = usePromise(() => getSchemaById(route.params.schemaId as string));

    const parent = usePromise(() => {
      if (
        !isRootLocale(state.locale) &&
        route.query.parent &&
        typeof route.query.parent === 'string'
      ) {
        return getDocumentById({
          id: route.query.parent,
          locale: state.locale.id,
          fallbackLocale: true,
        });
      }

      return Promise.resolve(null);
    });

    const form = ref<any>(null);

    const error = ref<Error | null>(null);

    const formErrors: Record<string, string> = reactive({});

    const stopLocaleWatcher = watchEffect(() => {
      if (parent.result.value) {
        if (parent.result.value.locale === state.locale.id) {
          stopLocaleWatcher();

          ElMessage.warning(
            'A locale override already exists for the specified document, navigating to it instead.',
          );

          router.push(`/documents/${parent.result.value.id}`);
        }
      }
    });

    const handleCreateDocument = usePromiseLazy(async () => {
      try {
        if (schema.result.value && form.value) {
          let valid: true | FieldErrorList = {};

          if (!parent.result.value) {
            valid = await form.value.validate().catch((e: FieldErrorList) => e);
          } else {
            const fieldsToValidate = getFormFieldIdentifiers(formData.value);

            valid = await validateFields(form.value, fieldsToValidate).catch(
              (e: FieldErrorList) => e,
            );

            console.log({ valid });
          }

          if (valid !== true) {
            displayClientValidationErrors(valid);

            return;
          }

          const doc = await createDocument(
            {
              data: formData.value,
              locale: state.locale.id,
              schemaId: schema.result.value?.id ?? '',
              parentId: parent.result.value?.id,
            },
            schema.result.value,
          );

          ElMessage.success('Document created successfully!');

          router.push(`/documents/${doc.id}`);
        }
      } catch (err) {
        if (err instanceof ApplicationErrorGroup) {
          displayServerValidationErrors(err);

          return;
        }

        if (err instanceof ApplicationError) {
          ElMessage.error(err.message);

          return;
        }

        throw err;
      }
    });

    return () => {
      if (schema.loading.value || parent.loading.value) {
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
              v-model={formData.value}
              schema={schema.result.value}
              parent={parent.result.value}
              document={{
                data: formData.value,
                locale: state.locale.id,
                schemaId: schema.result.value.id,
              }}
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
