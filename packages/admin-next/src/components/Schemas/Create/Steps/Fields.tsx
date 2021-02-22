import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaType } from '@dockite/types';

import SchemaFieldTreeComponent from '../../FieldTree/FieldTree';

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
            <el-form-item prop="fields">
              <SchemaFieldTreeComponent v-model={modelValue.value} />
            </el-form-item>

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
