import { ElMessage } from 'element-plus';
import { omit } from 'lodash';
import { Portal } from 'portal-vue';
import { computed, defineComponent, reactive, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { fetchAllSingletons, getSingletonById, updateSingleton } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { logE } from '~/common/logger';
import { BaseSchema, MaybePersisted, SchemaType } from '~/common/types';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { JsonEditorComponent } from '~/components/JsonEditor';
import { stableJSONStringify } from '~/utils';

export const SingletonImportPage = defineComponent({
  name: 'SingletonImportPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const singleton = reactive<MaybePersisted<BaseSchema>>({
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

    const fetchedSingleton = usePromise(() => getSingletonById(route.params.singletonId as string));

    const allSingletons = usePromise(() => fetchAllSingletons());

    const handleImportSingleton = usePromiseLazy(async () => {
      try {
        const updatedSingleton = await updateSingleton(
          singleton,
          route.params.singletonId as string,
        );

        ElMessage.success('Singleton successfully imported!');

        router.push(`/singletons/${updatedSingleton.id}`);
      } catch (err) {
        logE(err);

        ElMessage.error('Unable to import Singleton, please check for errors or try again later.');
      }
    });

    // Handles the manipulation of the Singleton in JSON format, maintaining the validity
    // during assignments.
    const singletonAsJSON = computed({
      get: () => stableJSONStringify(omit(singleton, 'type')),
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

      if (!fetchedSingleton.result.value) {
        return false;
      }

      const fetchedSingletonId = fetchedSingleton.result.value.id;

      return allSingletons.result.value.some(
        s => (s.id === singleton.id || s.name === singleton.name) && s.id !== fetchedSingletonId,
      );
    });

    const titleHasBeenUsed = computed(() => {
      if (!allSingletons.result.value) {
        return false;
      }

      if (!fetchedSingleton.result.value) {
        return false;
      }

      const fetchedSingletonTitle = fetchedSingleton.result.value.title;

      return allSingletons.result.value.some(
        s => s.title === singleton.title && s.title !== fetchedSingletonTitle,
      );
    });

    watchEffect(() => {
      if (fetchedSingleton.result.value && singleton.id !== fetchedSingleton.result.value.id) {
        Object.assign(singleton, fetchedSingleton.result.value);
      }
    });

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Import a Singleton</Portal>

          <div
            class="relative"
            v-loading={handleImportSingleton.loading.value || fetchedSingleton.loading.value}
          >
            <h3 class="text-lg font-semibold pb-5">Import a Singleton via JSON</h3>

            <blockquote class="p-3 border-l-4 border-gray-400 rounded text-sm bg-gray-200 mb-5">
              Using the editor below you can import a Singleton that has either been exported from a
              different installation or crafted for usage with the current installation.
            </blockquote>

            <RenderIfComponent condition={!!titleHasBeenUsed.value}>
              <div class="pb-5">
                <el-alert
                  type="warning"
                  title="Title has already been used"
                  description="The currently provided title has already been used with another Singleton. This may lead to confusion when navigating through the Admin UI, if this is intentional please ignore this warning."
                  closable={true}
                  showIcon
                />
              </div>
            </RenderIfComponent>

            <RenderIfComponent condition={!fetchedSingleton.loading.value}>
              <JsonEditorComponent v-model={singletonAsJSON.value} minHeight="60vh" />
            </RenderIfComponent>

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
        </>
      );
    };
  },
});

export default SingletonImportPage;
