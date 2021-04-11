import { DockiteFieldInputComponentProps } from '@dockite/types';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';

import { DockiteFieldNumberEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<number, DockiteFieldNumberEntity>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldNumberInput',
  props: {
    name: {
      type: String as PropType<InputComponentProps['name']>,
      required: true,
    },

    modelValue: {
      type: (null as any) as PropType<InputComponentProps['value']>,
      required: true,
    },

    formData: {
      type: Object as PropType<InputComponentProps['formData']>,
      required: true,
    },

    fieldConfig: {
      type: Object as PropType<InputComponentProps['fieldConfig']>,
      required: true,
    },

    errors: {
      type: Object as PropType<InputComponentProps['errors']>,
      required: true,
    },
  },
  setup: (props, ctx) => {
    const { errors, fieldConfig, modelValue, name } = toRefs(props);

    const rules = ref<Array<Record<string, any>>>([]);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    if (!fieldConfig.value.settings.float) {
      rules.value.push({
        type: 'integer',
        message: `${fieldConfig.value.title} must be a whole number`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.float) {
      rules.value.push({
        type: 'number',
        message: `${fieldConfig.value.title} must be a floating point number`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.min) {
      rules.value.push({
        type: 'number',
        min: Number(fieldConfig.value.settings.min),
        message: `${fieldConfig.value.title} must be greater than ${fieldConfig.value.settings.min}.`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.max) {
      rules.value.push({
        type: 'number',
        max: Number(fieldConfig.value.settings.max),
        message: `${fieldConfig.value.title} must be less than ${fieldConfig.value.settings.max}.`,
        trigger: 'blur',
      });
    }

    const precision = fieldConfig.value.settings.float ? 2 : 0;

    const step = fieldConfig.value.settings.float ? 0.1 : 1;

    const min = fieldConfig.value.settings.min || 0;

    const max = fieldConfig.value.settings.max || Number.MAX_SAFE_INTEGER;

    return () => (
      <el-form-item
        class={`dockite-field-number ${errors.value[name.value] ? 'is-error' : ''}`}
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
      >
        <el-input-number
          class="w-full"
          controlsPosition="right"
          max={max}
          min={min}
          precision={precision}
          step={step}
          v-model={fieldData.value}
        />

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}
        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
