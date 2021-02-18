import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaType } from '@dockite/types';

import { fieldsStepFormRules } from './formRules';
import { StepComponentProps } from './types';

export const SchemaCreateFieldsStepComponent = defineComponent({
  name: 'SchemaCreateFieldsStepComponent',

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

    const handleProgressStep = (): void => {
      if (form.value) {
        form.value.validate().then(() => {
          ctx.emit('progress:nextStep');
        });
      }
    };

    return () => {
      return (
        <div>
          <h3 class="text-lg font-semibold pb-3">
            Next, lets add fields to our {schemaType.value}!
          </h3>

          <blockquote class="border-l-4 rounded text-sm p-3 bg-gray-200 mb-5">
            The Singleton name should be reflective of the type of content it that it will hold.
            <span class="block pb-2" />
            An example of a good Singleton name would be <strong>Settings</strong> for a Singleton
            that is responsible for the management of settings for a particular backend.
          </blockquote>

          <el-form
            ref={form}
            model={modelValue.value}
            rules={fieldsStepFormRules}
            labelPosition="top"
          >
            <el-form-item>{/* TODO */}</el-form-item>

            <el-form-item>
              <div class="flex justify-between items-center pt-5">
                <span />

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

export default SchemaCreateFieldsStepComponent;
