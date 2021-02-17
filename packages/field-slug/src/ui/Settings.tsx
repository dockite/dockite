import { Field } from '@dockite/database';
import { defineComponent, PropType, computed } from 'vue';

import { SlugFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  modelValue: SlugFieldSettings;
  fields: Field[];
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldSlugSettings',

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
        <el-form-item label="Required">
          <el-switch v-model={settings.value.required} />

          <div class="el-form-item__description">
            Controls whether or not the field is required, if set to true the document will not be
            able to be saved without setting the field.
          </div>
        </el-form-item>

        <el-form-item label="Fields to slugify">
          <el-select v-model={settings.value.fieldsToSlugify} multiple filterable>
            {props.fields.map(field => (
              <el-option label={field.title} value={field.name} />
            ))}
          </el-select>

          <div class="el-form-item__description">
            The field to slugify, the field selected should be string-like for best results.
          </div>
        </el-form-item>

        <el-form-item label="Unique">
          <el-switch v-model={settings.value.unique} />

          <div class="el-form-item__description">
            Enables uniqueness checking across across slugs.
          </div>
        </el-form-item>

        <el-form-item class={{ hidden: !settings.value.unique }} label="Auto Increment">
          <el-switch v-model={settings.value.autoIncrement} />

          <div class="el-form-item__description">
            Enables the addition of "-[digit]" when a slug is not unique.
          </div>
        </el-form-item>

        <el-form-item label="Parent">
          <el-select v-model={settings.value.parent} clearable>
            {referenceFields.value.map(field => (
              <el-option label={field.title} value={field.name} />
            ))}
          </el-select>

          <div class="el-form-item__description">
            The parent field for the slug, if selected it will be used to evaluate uniqueness based
            on the parent.
          </div>
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
