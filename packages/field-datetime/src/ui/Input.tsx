import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { DockiteFieldInputComponentProps } from '@dockite/types';

import { DockiteFieldDateTimeEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<
  string | null,
  DockiteFieldDateTimeEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldDateTimeInput',
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
      if (fieldConfig.value.settings.date) {
        return (
          <el-date-picker
            v-model={fieldData.value}
            format={fieldConfig.value.settings.format}
            value-format="yyyy-MM-dd"
            editable
            clearable
            type="date"
          />
        );
      }

      if (fieldConfig.value.settings.time) {
        return (
          <el-time-picker
            v-model={fieldData}
            format={fieldConfig.value.settings.format}
            editable
            clearable
          />
        );
      }

      return (
        <el-date-picker
          v-model={fieldData}
          format={fieldConfig.value.settings.format}
          editable
          clearable
          type="datetime"
        />
      );
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    if (!fieldConfig.value.settings.time) {
      rules.value.push({
        message: `${fieldConfig.value.title} must be a valid datetime`,
        trigger: 'blur',
        validator(_rule: never, value: string | null, callback: Function) {
          const date = new Date(String(value));

          if (Number.isNaN(date.getTime()) && fieldConfig.value.settings.required) {
            callback(false);
          }

          callback();
        },
      });
    }

    return (): JSX.Element => (
      <el-form-item
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
        class={`dockite-field-datetime ${errors.value[name.value] ? 'is-error' : ''}`}
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
