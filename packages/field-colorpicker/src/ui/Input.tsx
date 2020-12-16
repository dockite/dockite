import { computed, defineComponent, PropType, ref, toRefs } from 'vue';
import { DockiteFieldInputComponentProps } from '@dockite/types';

import { DockiteFieldColorPickerEntity } from '../types';

import './Input.scss';

export type InputComponentProps = DockiteFieldInputComponentProps<
  string | null,
  DockiteFieldColorPickerEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldColorPickerInput',
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

    const rules = ref<Array<Record<string, any>>>([
      {
        pattern: /^#[A-F0-9]{6}$/i,
        message: `${fieldConfig.value.title} must be a valid hexadecimal color`,
        trigger: 'blur',
      },
    ]);

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
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
        class={`dockite-field-colorpicker ${errors.value[name.value] ? 'is-error' : ''}`}
      >
        <el-row type="flex" align="middle">
          <el-color-picker
            v-model={fieldData}
            style="width: 100%;"
            colorFormat="hex"
            predefine={fieldConfig.value.settings.predefinedColors}
          />
        </el-row>

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}

        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
