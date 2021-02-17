import { defineComponent, PropType, computed } from 'vue';

import { StringFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: StringFieldSettings;
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldStringSettings',

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
        <el-form-item label="Required">
          <el-switch v-model={settings.value.required} />

          <div class="el-form-item__description">
            Controls whether or not the field is required, if set to true the document will not be
            able to be saved without setting the field.
          </div>
        </el-form-item>

        <el-form-item label="URL Safe">
          <el-switch v-model={settings.value.urlSafe} />

          <div class="el-form-item__description">
            Controls whether or not the field should be URL safe, if set to true the field must only
            contain alphanumeric characters or the following: - _ +
          </div>
        </el-form-item>

        <el-form-item label="Textarea">
          <el-switch v-model={settings.value.textarea} />

          <div class="el-form-item__description">
            Controls whether the field is shown as a textarea or a simple text input.
          </div>
        </el-form-item>

        <el-form-item label="Min Length">
          <el-input-number v-model={settings.value.minLen} min={0} />

          <div class="el-form-item__description">
            Sets the minimum length for the field, if set to a number above 0 the field must contain
            at least that many characters.
          </div>
        </el-form-item>

        <el-form-item label="Max Length">
          <el-input-number v-model={settings.value.maxLen} min={0} />

          <div class="el-form-item__description">
            Sets the maximum length for the field, if set to a number above 0 the field must contain
            at most that many characters.
          </div>
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
