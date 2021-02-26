import { startCase } from 'lodash';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import { SchemaType } from '@dockite/types';

import { nameStepFormRules } from './formRules';
import { StepComponentProps } from './types';

export const SchemaCreatReviewStepComponent = defineComponent({
  name: 'SchemaCreatReviewStepComponent',

  props: {
    modelValue: Object as PropType<StepComponentProps['modelValue']>,
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as StepComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const schemaType = computed(() =>
      modelValue.value.type === SchemaType.DEFAULT ? 'Schema' : 'Singleton',
    );

    const handleProgressStep = (): void => {
      ctx.emit('progress:nextStep');
    };

    const handlePreviousStep = (): void => {
      ctx.emit('progress:previousStep');
    };

    return () => {
      return (
        <div>
          <h3 class="text-xl font-semibold pb-3">Finally, lets review the {schemaType.value}!</h3>

          <blockquote class="border-l-4 rounded text-sm p-3 bg-gray-200 mb-5">
            Just before we create the {schemaType.value}, let’s review what we’ve configured to
            ensure it’s what we were expecting. If anything is incorrect or missing, we can simply
            go back to the previous steps and update items where needed.
          </blockquote>

          <div class="text-lg">
            <h2 class="text-2xl font-semibold py-5">
              We're creating a {schemaType.value} called {modelValue.value.title}, using the API
              identifier {modelValue.value.name}
            </h2>

            <p class="pb-3">
              {modelValue.value.title} has{' '}
              <strong>{Object.keys(modelValue.value.groups).length} group(s)</strong> and a total of{' '}
              <strong>{modelValue.value.fields.length} field(s)</strong>.
            </p>

            <p class="pb-3">
              {modelValue.value.title} has{' '}
              <strong>{modelValue.value.settings.views.length} view(s)</strong> and{' '}
              <span class={{ hidden: modelValue.value.settings.enableMutations }}>
                will not allow the API to perform create, update, or delete actions.
              </span>
              <span class={{ hidden: !modelValue.value.settings.enableMutations }}>
                will allow the API to perform the following mutating actions:
              </span>
              <ul
                class={{
                  'pt-2 list-disc list-inside': true,
                  hidden: !modelValue.value.settings.enableMutations,
                }}
              >
                <li>Create a {modelValue.value.title}</li>
                <li>Update a {modelValue.value.title}</li>
                <li>Delete a {modelValue.value.title}</li>
              </ul>
            </p>
          </div>

          <div class="flex justify-between items-center pt-5">
            <el-button type="text" onClick={() => handlePreviousStep()}>
              Previous Step
            </el-button>

            <el-button type="primary" onClick={() => handleProgressStep()}>
              Next Step
            </el-button>
          </div>
        </div>
      );
    };
  },
});

export default SchemaCreatReviewStepComponent;
