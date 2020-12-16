import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { DockiteFieldInputComponentProps } from '@dockite/types';

import { DockiteFieldIDEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<
  string | number,
  DockiteFieldIDEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldIDInput',
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

    if (!fieldData.value) {
      fieldData.value = fieldConfig.value.settings.type === 'number' ? 0 : '';
    }

    const getInputComponent = (): JSX.Element => {
      if (fieldConfig.value.settings.type === 'number') {
        return (
          <el-input
            v-model={fieldData.value}
            type="number"
            controlsPosition="right"
            step={1}
            precision={1}
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

    return (): JSX.Element => (
      <el-form-item
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
        class={`dockite-field-id ${errors.value[name.value] ? 'is-error' : ''}`}
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
