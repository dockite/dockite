import { computed, defineComponent, PropType } from 'vue';

import { SchemaType } from '@dockite/types';

import { StepComponentProps } from './types';

export const SchemaCreateReviewStepComponent = defineComponent({
  name: 'SchemaCreateReviewStepComponent',

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

    const handleCreateSchema = (): void => {
      ctx.emit('action:createSchema');
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

          <h4 class="font-semibold text-lg pb-3">Summary</h4>

          <div class="bg-gray-200 border rounded text-sm py-3 px-5">
            <div class="flex -mx-3">
              <div class="w-1/2 px-3 flex">
                <ul class="font-semibold text-right pr-5">
                  <li class="pb-1 last:pb-0">Name</li>
                  <li class="pb-1 last:pb-0">Identifier</li>
                  <li class="pb-1 last:pb-0">Groups</li>
                  <li class="pb-1 last:pb-0">Fields</li>
                  <li class="pb-1 last:pb-0">Configured Views</li>
                </ul>
                <ul class="flex-1">
                  <li class="pb-1 last:pb-0">{modelValue.value.title}</li>
                  <li class="pb-1 last:pb-0">{modelValue.value.name}</li>
                  <li class="pb-1 last:pb-0">{Object.keys(modelValue.value.groups).length}</li>
                  <li class="pb-1 last:pb-0">{modelValue.value.fields.length}</li>
                  <li class="pb-1 last:pb-0">{modelValue.value.settings.views.length || 'None'}</li>
                </ul>
              </div>

              <div class="w-1/2 px-3 flex">
                <ul class="font-semibold text-right pr-5">
                  <li class="pb-1 last:pb-0">Mutations Enabled</li>
                  <li class="pb-1 last:pb-0">Create Mutation Enabled</li>
                  <li class="pb-1 last:pb-0">Update Mutation Enabled</li>
                  <li class="pb-1 last:pb-0">Delete Mutation Enabled</li>
                </ul>
                <ul>
                  <li class="pb-1 last:pb-0">
                    {modelValue.value.settings.enableMutations ? 'Yes' : 'No'}
                  </li>
                  <li class="pb-1 last:pb-0">
                    {modelValue.value.settings.enableCreateMutation ? 'Yes' : 'No'}
                  </li>
                  <li class="pb-1 last:pb-0">
                    {modelValue.value.settings.enableUpdateMutation ? 'Yes' : 'No'}
                  </li>
                  <li class="pb-1 last:pb-0">
                    {modelValue.value.settings.enableDeleteMutation ? 'Yes' : 'No'}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center pt-5">
            <el-button type="text" onClick={() => handlePreviousStep()}>
              Previous Step
            </el-button>

            <el-button type="primary" onClick={() => handleCreateSchema()}>
              Create {schemaType.value}
            </el-button>
          </div>
        </div>
      );
    };
  },
});

export default SchemaCreateReviewStepComponent;
