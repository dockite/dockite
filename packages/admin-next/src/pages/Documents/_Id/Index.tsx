import { ElMessage } from 'element-plus';
import { Portal } from 'portal-vue';
import { defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { getFooter } from './util';

import { getDocumentById, getSchemaById, getSingletonById } from '~/common/api';
import { updateDocument } from '~/common/api/document';
import {
  DASHBOARD_HEADER_PORTAL_ACTIONS,
  DASHBOARD_HEADER_PORTAL_TITLE,
  DASHBOARD_MAIN_PORTAL_FOOTER,
} from '~/common/constants';
import { ApplicationError, ApplicationErrorGroup } from '~/common/errors';
import { FieldErrorList } from '~/common/types';
import { DocumentFormComponent } from '~/components/Common/Document/Form';
import { DocumentHeaderActionsDropdownComponent } from '~/components/Documents/_Id/ActionsDropdown';
import { useGraphQL, useState } from '~/hooks';
import { getFormFieldIdentifiers, validateFields } from '~/pages/Schemas/_Id/Create/util';
import {
  displayClientValidationErrors,
  displayServerValidationErrors,
  getDocumentIdentifier,
  getRootLocale,
  isRootLocale,
} from '~/utils';

export const DocumentFormPage = defineComponent({
  name: 'DocumentFormPageComponent',

  setup: () => {
    const route = useRoute();

    const router = useRouter();

    const state = useState();

    const formData = ref<Record<string, any>>({});

    const document = usePromise(() =>
      getDocumentById({
        id: route.params.documentId as string,
        locale: state.locale.id,
      }),
    );

    const parent = usePromiseLazy((parentId: string) => {
      if (!isRootLocale(state.locale)) {
        return getDocumentById({
          id: parentId,
          locale: getRootLocale().id,
        });
      }

      return Promise.resolve(null);
    });

    const schema = usePromiseLazy((id: string) => getSchemaById(id));

    const singleton = usePromiseLazy((id: string) => getSingletonById(id));

    const form = ref<any>(null);

    const error = ref<Error | null>(null);

    const formErrors: Record<string, string> = reactive({});

    const { exceptionHandler } = useGraphQL();

    const handleUpdateDocument = usePromiseLazy(async () => {
      try {
        if (!document.result.value || !form.value) {
          ElMessage.warning('Document must be fetched before attempting to save.');

          return;
        }

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

        const doc = await updateDocument({ ...document.result.value, data: formData.value });

        ElMessage.success('Document updated successfully!');

        router.push(`/schemas/${doc.schemaId}`);
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

      if (
        document.result.value &&
        document.result.value.parentId &&
        !parent.loading.value &&
        (!parent.result.value || parent.result.value.id !== document.result.value.parentId)
      ) {
        parent.exec(document.result.value.parentId);
      }
    });

    return () => {
      if (schema.loading.value || document.loading.value || parent.loading.value) {
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
                title={getDocumentIdentifier(formData.value, document.result.value)}
              >
                {getDocumentIdentifier(formData.value, document.result.value)}
              </span>
            </Portal>

            <Portal to={DASHBOARD_HEADER_PORTAL_ACTIONS}>
              <DocumentHeaderActionsDropdownComponent
                document={document.result.value}
                {...{
                  'onAction:saveDocument': handleUpdateDocument.exec,
                }}
              />
            </Portal>

            <DocumentFormComponent
              v-model={formData.value}
              schema={schema.result.value}
              document={document.result.value}
              errors={formErrors}
              parent={parent.result.value}
              formRef={form}
            />

            <Portal to={DASHBOARD_MAIN_PORTAL_FOOTER}>{getFooter()}</Portal>
          </>
        );
      }

      return <div>An unknown error is ocurring</div>;
    };
  },
});

export default DocumentFormPage;
