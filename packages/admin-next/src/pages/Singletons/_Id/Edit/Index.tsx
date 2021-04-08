import { ElMessage } from 'element-plus';
import { cloneDeep } from 'lodash';
import { Portal } from 'portal-vue';
import { Component, defineComponent, ref, watchEffect } from 'vue';
import { usePromise, usePromiseLazy } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { Schema } from '@dockite/database';

import { getSingletonById, updateSingleton } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError } from '~/common/errors';
import {
  SchemaCreateFieldsStepComponent,
  SchemaCreateNameStepComponent,
  SchemaCreateReviewStepComponent,
  SchemaCreateSettingsStepComponent,
} from '~/components/Schemas/Create/Steps';

export const MAXIMUM_STEP = 3;

export const SingletonEditPage = defineComponent({
  name: 'SingletonEditPage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const activeStep = ref(0);

    const singleton = ref<Schema | null>(null);

    const fetchedSingleton = usePromise(() => getSingletonById(route.params.singletonId as string));

    const handleUpdateSingleton = usePromiseLazy(
      async (): Promise<void> => {
        try {
          if (!singleton.value) {
            throw new Error('');
          }

          const updatedSchema = await updateSingleton(
            singleton.value,
            route.params.singletonId as string,
          );

          ElMessage.success('Successfully updated Singleton!');

          router.push(`/singletons/${updatedSchema.id}`);
        } catch (err) {
          if (err instanceof ApplicationError) {
            ElMessage.error(err.message);
          }
        }
      },
    );

    watchEffect(() => {
      if (fetchedSingleton.result.value) {
        if (!singleton.value || singleton.value.id !== fetchedSingleton.result.value.id) {
          singleton.value = cloneDeep(fetchedSingleton.result.value);
        }
      }
    });

    const handleIncrementStep = (): void => {
      if (activeStep.value < MAXIMUM_STEP) {
        activeStep.value += 1;
      }
    };

    const handleDecrementStep = (): void => {
      if (activeStep.value > 0) {
        activeStep.value -= 1;
      }
    };

    const getActiveStepComponent = (): Component => {
      switch (activeStep.value) {
        case 0:
          return (
            <SchemaCreateNameStepComponent
              v-model={singleton.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 1:
          return (
            <SchemaCreateFieldsStepComponent
              v-model={singleton.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 2:
          return (
            <SchemaCreateSettingsStepComponent
              v-model={singleton.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 3:
          return (
            <SchemaCreateReviewStepComponent
              v-model={singleton.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
                'onAction:updateSchema': () => handleUpdateSingleton.exec(),
              }}
            />
          );

        default:
          return (
            <SchemaCreateNameStepComponent
              v-model={singleton.value}
              updating
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );
      }
    };

    return () => {
      return (
        <>
          <Portal to={DASHBOARD_HEADER_PORTAL_TITLE}>Update {singleton.value?.title}</Portal>

          <div v-loading={handleUpdateSingleton.loading.value || fetchedSingleton.loading.value}>
            <div class="py-5 -mx-5">
              <el-steps active={activeStep.value} finishStatus="success" alignCenter>
                <el-step title="Name" description="Name your Singleton" />
                <el-step title="Fields" description="Add the Fields" />
                <el-step title="Settings" description="Apply additional Settings" />
                <el-step title="Review" description="Review the Singleton" />
              </el-steps>
            </div>

            {singleton.value && getActiveStepComponent()}
          </div>
        </>
      );
    };
  },
});

export default SingletonEditPage;
