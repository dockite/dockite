import { defineComponent, PropType, computed } from 'vue';

import { DateTimeFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: DateTimeFieldSettings;
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

        <el-form-item label="Date only">
          <el-switch v-model={settings.value.date} />
        </el-form-item>

        <el-form-item label="Time only">
          <el-switch v-model={settings.value.time} />
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
