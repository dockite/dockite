import { DockiteFieldInputComponentProps } from '@dockite/types';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';

import { DockiteFieldStringEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<string, DockiteFieldStringEntity>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldStringInput',

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

    const getInputComponent = (): JSX.Element => {
      if (fieldConfig.value.settings.textarea) {
        return (
          <el-input
            v-model={fieldData.value}
            type="textarea"
            autosize={{ minRows: 3, maxRows: 8 }}
            allow-clear
          />
        );
      }

      return <el-input v-model={fieldData.value} />;
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.urlSafe) {
      rules.value.push({
        pattern: /^[A-Za-z0-9-_]+$/,
        message: `${fieldConfig.value.title} must be URL Safe`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.minLen) {
      rules.value.push({
        min: Number(fieldConfig.value.settings.minLen),
        message: `${fieldConfig.value.title} must contain atleast ${fieldConfig.value.settings.minLen} characters.`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.maxLen) {
      rules.value.push({
        max: Number(fieldConfig.value.settings.maxLen),
        message: `${fieldConfig.value.title} must contain no more than ${fieldConfig.value.settings.maxLen} characters.`,
        trigger: 'blur',
      });
    }

    return (): JSX.Element => (
      <el-form-item
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
        class={`dockite-field-string ${errors.value[name.value] ? 'is-error' : ''}`}
      >
        {getInputComponent()}

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}

        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
