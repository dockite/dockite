import { defineComponent, PropType, computed } from 'vue';

import { VariantFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  modelValue: VariantFieldSettings;
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldVariantSettings',

  props: {
    modelValue: {
      type: Object as PropType<SettingsComponentProps['modelValue']>,
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
      </>
    );
  },
});

export default SettingsComponent;
