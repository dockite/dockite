import { ElMessage } from 'element-plus';
import { omit } from 'lodash';
import { computed, defineComponent, reactive, ref } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRouter } from 'vue-router';

import { SchemaType } from '@dockite/types';

import { createSingleton, fetchAllSingletons } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { logE } from '~/common/logger';
import { BaseSchema, MaybePersisted } from '~/common/types';
import { JsonEditorComponent } from '~/components/JsonEditor';
import { usePortal } from '~/hooks';

export const SingletonImportPage = defineComponent({
  name: 'SingletonImportPage',

  setup: () => {
    const router = useRouter();
    const { setPortal } = usePortal();

    const singleton = reactive<MaybePersisted<BaseSchema>>({
      name: 'identifier',
      title: 'Title',
      type: SchemaType.SINGLETON,
      groups: {},
      fields: [],
      settings: {
        enableMutations: false,
        fieldsToDisplay: [],
        views: [],
      },
    });

    const validJSON = ref(true);

    const allSingletons = usePromise(() => fetchAllSingletons());

    const handleImportSingleton = usePromiseLazy(async () => {
      try {
        const createdSingleton = await createSingleton(singleton);

        ElMessage.success('Singleton successfully imported!');

        router.push(`/singletons/${createdSingleton.id}`);
      } catch (err) {
        logE(err);

        ElMessage.error('Unable to import Singleton, please check for errors or try again later.');
      }
    });

    // Handles the manipulation of the Singleton in JSON format, maintaining the validity
    // during assignments.
    const singletonAsJSON = computed({
      get: () => JSON.stringify(omit(singleton, 'type'), null, 2),
      set: value => {
        try {
          Object.assign(singleton, JSON.parse(value));

          validJSON.value = true;
        } catch {
          validJSON.value = false;
        }
      },
    });

    const singletonHasBeenUsed = computed(() => {
      if (!allSingletons.result.value) {
        return false;
      }

      return allSingletons.result.value.some(
        s => s.id === singleton.id || s.name === singleton.name,
      );
    });

    const titleHasBeenUsed = computed(() => {
      if (!allSingletons.result.value) {
        return false;
      }

      return allSingletons.result.value.some(s => s.title === singleton.title);
    });

    setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Import Singleton</span>);

    return () => {
      return (
        <div class="relative" v-loading={handleImportSingleton.loading.value}>
          <h3 class="text-lg font-semibold pb-5">Import a Singleton via JSON</h3>

          <blockquote class="p-3 border-l-4 border-gray-400 rounded text-sm bg-gray-200 mb-5">
            Using the editor below you can import a Singleton that has either been exported from a
            different installation or crafted for usage with the current installation.
          </blockquote>

          {singletonHasBeenUsed.value && (
            <div class="pb-5">
              <el-alert
                type="error"
                title="Singleton already exists"
                description="The details provided are already in use with an existing Singleton. If you wish to update that Singleton, please navigate to its import page."
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

          <JsonEditorComponent v-model={singletonAsJSON.value} minHeight="60vh" />

          <div class="flex flex-row-reverse pt-3">
            <el-button
              type="primary"
              title={validJSON.value ? '' : 'Invalid JSON data provided'}
              disabled={!validJSON.value || singletonHasBeenUsed.value}
              onClick={() => handleImportSingleton.exec()}
            >
              Import Singleton
            </el-button>
          </div>
        </div>
      );
    };
  },
});

export default SingletonImportPage;
