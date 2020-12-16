import { defineComponent, PropType, computed } from 'vue';

import { IDFieldSettings, defaultOptions, AvailableTypes } from '../types';

interface SettingsComponentProps {
  value: IDFieldSettings;
}

export const SettingsComponent = defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<SettingsComponentProps['value']>,
      required: true,
    },
  },
  setup: (props, ctx) => {
    const settings = computed({
      get: () => props.modelValue,
      set: value => ctx.emit('update:modelValue', value),
    });

    if (!settings.value) {
      settings.value = { ...defaultOptions };
    }

    settings.value = {
      ...defaultOptions,
      ...settings.value,
    };

    return (): JSX.Element => (
      <>
        <el-form-item label="Required">
          <el-switch v-model={settings.value.required} />
        </el-form-item>

        <el-form-item label="ID Type">
          <el-select v-model={settings.value.type}>
            {AvailableTypes.map(type => (
              <el-option label={type} value={type} />
            ))}
          </el-select>
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
