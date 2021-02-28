import { ElMessage } from 'element-plus';
import { Component, defineComponent, reactive, ref } from 'vue';
import { usePromiseLazy } from 'vue-composable';
import { useRouter } from 'vue-router';

import { SchemaType } from '@dockite/database/lib/types';

import { createSchema } from '~/common/api';
import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { ApplicationError } from '~/common/errors';
import { BaseSchema } from '~/common/types';
import {
  SchemaCreateFieldsStepComponent,
  SchemaCreateNameStepComponent,
  SchemaCreateSettingsStepComponent,
  SchemaCreatReviewStepComponent,
} from '~/components/Schemas/Create/Steps';
import { usePortal } from '~/hooks';

export const MAXIMUM_STEP = 3;

export const SchemaCreatePage = defineComponent({
  name: 'SchemaCreatePage',

  setup: () => {
    const { setPortal } = usePortal();

    const router = useRouter();

    const activeStep = ref(0);

    const schema = reactive<BaseSchema>({
      name: '',
      title: '',
      type: SchemaType.DEFAULT,
      groups: {},
      fields: [],
      settings: {
        enableMutations: false,
        fieldsToDisplay: [],
        views: [],
      },
    });

    setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Create a new Schema</span>);

    const handleCreateSchema = usePromiseLazy(
      async (): Promise<void> => {
        try {
          const createdSchema = await createSchema(schema);

          ElMessage.success('Successfully created Schema!');

          router.push(`/schemas/${createdSchema.id}`);
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
              v-model={schema}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 1:
          return (
            <SchemaCreateFieldsStepComponent
              v-model={schema}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 2:
          return (
            <SchemaCreateSettingsStepComponent
              v-model={schema}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
              }}
            />
          );

        case 3:
          return (
            <SchemaCreatReviewStepComponent
              v-model={schema}
              {...{
                'onProgress:nextStep': () => handleIncrementStep(),
                'onProgress:previousStep': () => handleDecrementStep(),
                'onAction:createSchema': () => handleCreateSchema.exec(),
              }}
            />
          );

        default:
          return (
            <SchemaCreateNameStepComponent
              v-model={schema}
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
        <div v-loading={handleCreateSchema.loading.value}>
          <div class="py-5 -mx-5">
            <el-steps active={activeStep.value} finishStatus="success" alignCenter>
              <el-step title="Name" description="Name your Schema" />
              <el-step title="Fields" description="Add the Fields" />
              <el-step title="Settings" description="Apply additional Settings" />
              <el-step title="Review" description="Review the Schema" />
            </el-steps>
          </div>

          {getActiveStepComponent()}
        </div>
      );
    };
  },
});

export default SchemaCreatePage;
