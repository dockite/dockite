import { ElMessage } from 'element-plus';
import { omit } from 'lodash';
import { computed, defineComponent, reactive, ref } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRouter } from 'vue-router';

import { createSchema, fetchAllSchemas } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { logE } from '~/common/logger';
import { BaseSchema, SchemaType, MaybePersisted } from '~/common/types';
import { JsonEditorComponent } from '~/components/JsonEditor';
import { usePortal } from '~/hooks';

export const SchemaImportPage = defineComponent({
  name: 'SchemaImportPage',

  setup: () => {
    const router = useRouter();
    const { setPortal } = usePortal();

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

    const allSchemas = usePromise(() => fetchAllSchemas());

    const handleImportSchema = usePromiseLazy(async () => {
      try {
        const createdSchema = await createSchema(schema);

        ElMessage.success('Schema successfully imported!');

        router.push(`/schemas/${createdSchema.id}`);
      } catch (err) {
        logE(err);

        ElMessage.error('Unable to import Schema, please check for errors or try again later.');
      }
    });

    // Handles the manipulation of the Schema in JSON format, maintaining the validity
    // during assignments.
    const schemaAsJSON = computed({
      get: () => JSON.stringify(omit(schema, 'type'), null, 2),
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

      return allSchemas.result.value.some(s => s.id === schema.id || s.name === schema.name);
    });

    const titleHasBeenUsed = computed(() => {
      if (!allSchemas.result.value) {
        return false;
      }

      return allSchemas.result.value.some(s => s.title === schema.title);
    });

    setPortal(DASHBOARD_HEADER_PORTAL_TITLE, 'Import Schema');

    return () => {
      return (
        <div class="relative" v-loading={handleImportSchema.loading.value}>
          <h3 class="text-lg font-semibold pb-5">Import a Schema via JSON</h3>

          <blockquote class="p-3 border-l-4 border-gray-400 rounded text-sm bg-gray-200 mb-5">
            Using the editor below you can import a Schema that has either been exported from a
            different installation or crafted for usage with the current installation.
          </blockquote>

          {schemaHasBeenUsed.value && (
            <div class="pb-5">
              <el-alert
                type="error"
                title="Schema already exists"
                description="The details provided already in use with an existing Schema. If you wish to update that Schema, please navigate to its import page."
                closable={false}
                showIcon
              />
            </div>
          )}

          {titleHasBeenUsed.value && (
            <div class="pb-5">
              <el-alert
                type="warning"
                title="Title has already been used"
                description="The currently provided title has already been used with another Singleton. This may lead to confusion when navigating through the Admin UI, if this is intentional please ignore this warning."
                closable={true}
                showIcon
              />
            </div>
          )}

          <JsonEditorComponent v-model={schemaAsJSON.value} minHeight="60vh" />

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
      );
    };
  },
});

export default SchemaImportPage;
