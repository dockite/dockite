import { computed, defineComponent, PropType, ref, Transition, TransitionGroup, watch } from 'vue';

import { SchemaType } from '@dockite/types';

import { fieldsStepFormRules } from './formRules';
import { StepComponentProps } from './types';

export const SchemaCreateSettingsStepComponent = defineComponent({
  name: 'SchemaCreateSettingsStepComponent',

  props: {
    modelValue: Object as PropType<StepComponentProps['modelValue']>,
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as StepComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const form = ref<any | null>(null);

    const schemaType = computed(() =>
      modelValue.value.type === SchemaType.DEFAULT ? 'Schema' : 'Singleton',
    );

    watch(
      () => modelValue.value.settings,
      (oldValue, newValue) => {
        // If we've recently enabled mutations and it wasn't previously enabled
        if (!oldValue.enableMutations && newValue.enableMutations) {
          // Enable the per mutation type settings.
          modelValue.value.settings = {
            ...modelValue.value.settings,
            enableCreateMutation: true,
            enableUpdateMutation: true,
            enableDeleteMutation: true,
          };
        }
      },
    );

    const handleProgressStep = (): void => {
      if (form.value) {
        form.value.validate().then(() => {
          ctx.emit('progress:nextStep');
        });
      }
    };

    const handlePreviousStep = (): void => {
      if (form.value) {
        form.value.validate().then(() => {
          ctx.emit('progress:previousStep');
        });
      }
    };

    return () => {
      return (
        <div>
          <h3 class="text-xl font-semibold pb-3">Now, lets configure our {schemaType.value}!</h3>

          <blockquote class="border-l-4 rounded text-sm p-3 bg-gray-200 mb-5">
            Fields define the content that a {schemaType.value} can hold. You may add string fields
            for names and descriptions, number fields for prices, ratings, and so forth.
            <span class="block pb-2" />A {schemaType.value} can have as many fields as you desire;
            however, the more you add, the harder it may be to manage later.
          </blockquote>

          <el-form
            ref={form}
            model={modelValue.value}
            rules={fieldsStepFormRules}
            labelPosition="top"
          >
            <fieldset class="pb-3 border-b">
              <legend class="text-lg font-semibold pb-3">API Methods</legend>

              <el-form-item label="Enable Muatations?" prop="settings.enableMutations">
                <el-switch v-model={modelValue.value.settings.enableMutations} />

                <div class="el-form-item__description">
                  Controls whether mutations are enabled for the {schemaType.value}. By enabling
                  this you will have access to API methods such as:{' '}
                  <u>create{modelValue.value.name}</u>, <u>update{modelValue.value.name}</u>, and{' '}
                  <u>delete{modelValue.value.name}</u>.
                </div>
              </el-form-item>

              {/* I am not enjoying applying transitions in this matter */}
              <Transition name="el-fade-in-linear">
                {modelValue.value.settings.enableMutations ? (
                  <div>
                    <el-form-item label="Enable Create Muatation?" prop="settings.enableMutations">
                      <el-switch v-model={modelValue.value.settings.enableCreateMutation} />

                      <div class="el-form-item__description">
                        Controls whether the document creation API method is enabled for the{' '}
                        {schemaType.value}. By enabling this you will be able to create{' '}
                        {modelValue.value.title} documents using the GraphQL API.
                      </div>
                    </el-form-item>

                    <el-form-item label="Enable Update Muatation?" prop="settings.enableMutations">
                      <el-switch v-model={modelValue.value.settings.enableUpdateMutation} />

                      <div class="el-form-item__description">
                        Controls whether the document update API method is enabled for the{' '}
                        {schemaType.value}. By enabling this you will be able to update{' '}
                        {modelValue.value.title} documents using the GraphQL API.
                      </div>
                    </el-form-item>

                    <el-form-item label="Enable Delete Muatation?" prop="settings.enableMutations">
                      <el-switch v-model={modelValue.value.settings.enableDeleteMutation} />

                      <div class="el-form-item__description">
                        Controls whether the document deletion API method is enabled for the{' '}
                        {schemaType.value}. By enabling this you will be able to delete{' '}
                        {modelValue.value.title} documents using the GraphQL API.
                      </div>
                    </el-form-item>
                  </div>
                ) : (
                  <span></span>
                )}
              </Transition>
            </fieldset>

            <fieldset
              class={{ 'mt-5 pb-3 border-b': true, hidden: schemaType.value === 'Singleton' }}
            >
              <legend class="text-lg font-semibold pb-3">Document Views</legend>
            </fieldset>

            <el-form-item>
              <div class="flex justify-between items-center pt-5">
                <el-button type="text" onClick={() => handlePreviousStep()}>
                  Previous Step
                </el-button>

                <el-button type="primary" onClick={() => handleProgressStep()}>
                  Next Step
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      );
    };
  },
});

export default SchemaCreateSettingsStepComponent;
