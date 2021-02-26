import { Component, defineComponent, reactive, ref } from 'vue';

import { Field } from '@dockite/database';
import { SchemaType } from '@dockite/database/lib/types';

import { DASHBOARD_HEADER_PORTAL_TITLE } from '~/common/constants';
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

    const activeStep = ref(3);

    // const schema = reactive<BaseSchema>({
    //   name: '',
    //   title: '',
    //   type: SchemaType.DEFAULT,
    //   groups: {},
    //   fields: [],
    //   settings: {},
    // });
    const schema = reactive<BaseSchema>({
      name: 'MySchema',
      title: 'MySchema',
      type: SchemaType.DEFAULT,
      groups: { General: ['asdf', 'sdfv', 'erwt'] },
      fields: ([
        {
          name: 'asdf',
          title: 'asdf',
          type: 'boolean',
          description: '',
          settings: { required: false },
        },
        {
          name: 'sdfv',
          title: 'vsdfv',
          type: 'group',
          description: '',
          settings: { required: false, repeatable: false, children: [], minRows: 0, maxRows: 0 },
        },
        {
          name: 'erwt',
          title: 'erbewr',
          type: 'colorpicker',
          description: '',
          settings: { required: false },
        },
      ] as any) as Field[],
      settings: {
        enableMutations: false,
        fieldsToDisplay: [],
        views: [],
      },
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
