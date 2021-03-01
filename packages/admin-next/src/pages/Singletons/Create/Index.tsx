import { ElMessage } from 'element-plus';
import { Component, defineComponent, reactive, ref } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRouter } from 'vue-router';

import { SchemaType } from '@dockite/database/lib/types';

import { createSingleton } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError } from '~/common/errors';
import { BaseSchema } from '~/common/types';
import {
  SchemaCreateFieldsStepComponent,
  SchemaCreateNameStepComponent,
  SchemaCreateSettingsStepComponent,
  SchemaCreateReviewStepComponent,
} from '~/components/Schemas/Create/Steps';
import { usePortal } from '~/hooks';

export const MAXIMUM_STEP = 3;

export const SingletonCreatePage = defineComponent({
  name: 'SingletonCreatePage',

  setup: () => {
    const { setPortal } = usePortal();

    const router = useRouter();

    const activeStep = ref(0);

    const singleton = reactive<BaseSchema>({
      name: '',
      title: '',
      type: SchemaType.SINGLETON,
      groups: {},
      fields: [],
      settings: {
        enableMutations: false,
        fieldsToDisplay: [],
        views: [],
      },
    });

    setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Create a new Singleton</span>);

    const handleCreateSingleton = usePromiseLazy(
      async (): Promise<void> => {
        try {
          const createdSchema = await createSingleton(singleton);

          ElMessage.success('Successfully created Singleton!');

          router.push(`/singletons/${createdSchema.id}`);
        } catch (err) {
          if (err instanceof ApplicationError) {
            ElMessage.error(err.message);
          }
        }
      },
    );

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
              v-model={singleton}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 1:
          return (
            <SchemaCreateFieldsStepComponent
              v-model={singleton}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 2:
          return (
            <SchemaCreateSettingsStepComponent
              v-model={singleton}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 3:
          return (
            <SchemaCreateReviewStepComponent
              v-model={singleton}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
                'onAction:createSchema': () => handleCreateSingleton.exec(),
              }}
            />
          );

        default:
          return (
            <SchemaCreateNameStepComponent
              v-model={singleton}
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
        <div v-loading={handleCreateSingleton.loading.value}>
          <div class="py-5 -mx-5">
            <el-steps active={activeStep.value} finishStatus="success" alignCenter>
              <el-step title="Name" description="Name your Singleton" />
              <el-step title="Fields" description="Add the Fields" />
              <el-step title="Settings" description="Apply additional Settings" />
              <el-step title="Review" description="Review the Singleton" />
            </el-steps>
          </div>

          {getActiveStepComponent()}
        </div>
      );
    };
  },
});

export default SingletonCreatePage;
