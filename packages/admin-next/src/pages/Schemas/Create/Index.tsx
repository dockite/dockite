import { SchemaType } from '@dockite/database/lib/types';
import { Component, defineComponent, reactive, ref } from 'vue';

import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
import { BaseSchema } from '~/common/types';
import {
  SchemaCreateFieldsStepComponent,
  SchemaCreateNameStepComponent,
} from '~/components/Schemas/Create/Steps';
import { usePortal } from '~/hooks';

export const MAXIMUM_STEP = 4;

export const SchemaCreatePage = defineComponent({
  name: 'SchemaCreatePage',

  setup: () => {
    const { setPortal } = usePortal();

    const activeStep = ref(1);

    const schema = reactive<BaseSchema>({
      name: '',
      title: '',
      type: SchemaType.DEFAULT,
      groups: {},
      fields: [],
      settings: {},
    });

    setPortal(DASHBOARD_HEADER_PORTAL_TITLE, <span>Create a new Schema</span>);

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
        <div>
          <div class="py-5 -mx-5">
            <el-steps active={activeStep.value} finishStatus="success" alignCenter>
              <el-step title="Name" description="Name your Schema"></el-step>
              <el-step title="Fields" description="Add the Fields"></el-step>
              <el-step title="Settings" description="Apply additional Settings"></el-step>
              <el-step title="Review" description="Review the Schema"></el-step>
            </el-steps>
          </div>

          {getActiveStepComponent()}
        </div>
      );
    };
  },
});

export default SchemaCreatePage;
