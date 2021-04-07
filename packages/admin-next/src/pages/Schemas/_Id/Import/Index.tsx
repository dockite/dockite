import { ElMessage } from 'element-plus';
import { omit } from 'lodash';
import { Portal } from 'portal-vue';
import { computed, defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { fetchAllSchemas, getSchemaById, updateSchema } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { logE } from '~/common/logger';
import { BaseSchema, MaybePersisted, SchemaType } from '~/common/types';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { JsonEditorComponent } from '~/components/JsonEditor';
import { stableJSONStringify } from '~/utils';

export const SchemaImportPage = defineComponent({
  name: 'SchemaImportPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const schema = reactive<MaybePersisted<BaseSchema>>({
      name: 'identifier',
      title: 'Title',
      type: SchemaType.DEFAULT,
      groups: {},
      fields: [],
      settings: {
        enableMutations: false,
        fieldsToDisplay: [],
        views: [],
      },
    });

    const validJSON = ref(true);

    const fetchedSchema = usePromise(() => getSchemaById(route.params.schemaId as string));

    const allSchemas = usePromise(() => fetchAllSchemas());

    const handleImportSchema = usePromiseLazy(async () => {
      try {
        const updatedSchema = await updateSchema(schema, route.params.schemaId as string);

        ElMessage.success('Schema successfully imported!');

        router.push(`/schemas/${updatedSchema.id}`);
      } catch (err) {
        logE(err);

        ElMessage.error('Unable to import Schema, please check for errors or try again later.');
      }
    });

    // Handles the manipulation of the Schema in JSON format, maintaining the validity
    // during assignments.
    const schemaAsJSON = computed({
      get: () => stableJSONStringify(omit(schema, 'type')),
      set: value => {
        try {
          Object.assign(schema, JSON.parse(value));

          validJSON.value = true;
        } catch {
          validJSON.value = false;
        }
      },
    });

    const schemaHasBeenUsed = computed(() => {
      if (!allSchemas.result.value) {
        return false;
      }

      if (!fetchedSchema.result.value) {
        return false;
      }

      const fetchedSchemaId = fetchedSchema.result.value.id;

      return allSchemas.result.value.some(
        s => (s.id === schema.id || s.name === schema.name) && s.id !== fetchedSchemaId,
      );
    });

    const titleHasBeenUsed = computed(() => {
      if (!allSchemas.result.value) {
        return false;
      }

      if (!fetchedSchema.result.value) {
        return false;
      }

      const fetchedSchemaTitle = fetchedSchema.result.value.title;

      return allSchemas.result.value.some(
        s => s.title === schema.title && s.title !== fetchedSchemaTitle,
      );
    });

    watchEffect(() => {
      if (fetchedSchema.result.value && schema.id !== fetchedSchema.result.value.id) {
        Object.assign(schema, fetchedSchema.result.value);
      }
    });

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Import a Schema</Portal>

          <div
            class="relative"
            v-loading={handleImportSchema.loading.value || fetchedSchema.loading.value}
          >
            <h3 class="text-lg font-semibold pb-5">Import a Schema via JSON</h3>

            <blockquote class="p-3 border-l-4 border-gray-400 rounded text-sm bg-gray-200 mb-5">
              Using the editor below you can import a Schema that has either been exported from a
              different installation or crafted for usage with the current installation.
            </blockquote>

            <RenderIfComponent condition={!!titleHasBeenUsed.value}>
              <div class="pb-5">
                <el-alert
                  type="warning"
                  title="Title has already been used"
                  description="The currently provided title has already been used with another Schema. This may lead to confusion when navigating through the Admin UI, if this is intentional please ignore this warning."
                  closable={true}
                  showIcon
                />
              </div>
            </RenderIfComponent>

            <RenderIfComponent condition={!fetchedSchema.loading.value}>
              <JsonEditorComponent v-model={schemaAsJSON.value} minHeight="60vh" />
            </RenderIfComponent>

            <div class="flex flex-row-reverse pt-3">
              <el-button
                type="primary"
                title={validJSON.value ? '' : 'Invalid JSON data provided'}
                disabled={!validJSON.value || schemaHasBeenUsed.value}
                onClick={() => handleImportSchema.exec()}
              >
                Import Schema
              </el-button>
            </div>
          </div>
        </>
      );
    };
  },
});

export default SchemaImportPage;
