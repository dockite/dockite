import { Field } from '@dockite/database';
import { defineComponent, PropType, computed } from 'vue';

import { SortIndexFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  modelValue: SortIndexFieldSettings;
  fields: Field[];
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldSortIndexSettings',

  props: {
    modelValue: {
      type: Object as PropType<SettingsComponentProps['modelValue']>,
      required: true,
    },

    fields: {
      type: Array as PropType<SettingsComponentProps['fields']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const settings = computed({
      get: () => props.modelValue,
      set: value => ctx.emit('update:modelValue', value),
    });

    const referenceFields = computed(() => {
      return props.fields.filter(
        field => field.type.includes('reference') && field.type !== 'reference_of',
      );
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
        <el-form-item label="Parent Field">
          <el-select v-model={settings.value.parentField} clearable>
            {referenceFields.value.map(field => (
              <el-option label={field.title} value={field.name} />
            ))}
          </el-select>

          <div class="el-form-item__description">
            The parent field for the Schema if it allows for tree relationships.
          </div>
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
