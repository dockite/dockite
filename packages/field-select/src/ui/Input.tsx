import { DockiteFieldInputComponentProps } from '@dockite/types';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';

import { DockiteFieldSelectEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<
  string | string[],
  DockiteFieldSelectEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldSelectInput',

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

    const settings = computed(() => fieldConfig.value.settings);

    if (fieldData.value) {
      if (settings.value.multiple && !Array.isArray(fieldData.value)) {
        fieldData.value = [fieldData.value];
      }

      if (!settings.value.multiple && Array.isArray(fieldData.value)) {
        // eslint-disable-next-line prefer-destructuring
        fieldData.value = fieldData.value[0];
      }
    }

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    return () => (
      <el-form-item
        class={`dockite-field-select ${errors.value[name.value] ? 'is-error' : ''}`}
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
      >
        <el-select
          v-model={fieldData.value}
          multiple={settings.value.multiple}
          style="width: 100%"
          filterable
          default-first-option
        >
          {settings.value.options.map(option => (
            <el-option label={option.label} value={option.value} />
          ))}
        </el-select>

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}

        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
