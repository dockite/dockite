import { DockiteFieldInputComponentProps } from '@dockite/types';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';

import { DockiteFieldBooleanEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<
  boolean,
  DockiteFieldBooleanEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldBooleanInput',

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

    return () => (
      <el-form-item
        class={`dockite-field-boolean ${errors.value[name.value] ? 'is-error' : ''}`}
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
      >
        <el-switch v-model={fieldData.value} size="large" />

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}
        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
