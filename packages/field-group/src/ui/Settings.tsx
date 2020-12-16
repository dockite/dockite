import { defineComponent, PropType, computed } from 'vue';

import { GroupFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: GroupFieldSettings;
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

        <el-form-item label="Repeatable">
          <el-switch v-model={settings.value.repeatable} />
        </el-form-item>

        <el-form-item label="Min Rows">
          <el-input-number v-model={settings.value.minRows} />
        </el-form-item>

        <el-form-item label="Max Rows">
          <el-input-number v-model={settings.value.maxRows} />
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
