import { computed, defineComponent, PropType } from 'vue';

import { NumberFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: NumberFieldSettings;
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

    return () => (
      <>
        <el-form-item label="Required" prop="settings.required">
          <el-switch v-model={settings.value.required} />
        </el-form-item>
        <el-form-item label="Float" prop="settings.float">
          <el-switch v-model={settings.value.float} />
        </el-form-item>
        <el-form-item label="Min Value" prop="settings.min">
          <el-input-number v-model={settings.value.min} />
        </el-form-item>
        <el-form-item label="Max Value" prop="settings.max">
          <el-input-number v-model={settings.value.max} />
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
