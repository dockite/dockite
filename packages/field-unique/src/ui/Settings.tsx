import { Field, BaseField } from '@dockite/database';
import { defineComponent, computed, PropType, ref } from 'vue';

import { UniqueFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  modelValue: UniqueFieldSettings;
  fields: Field[];
}

interface FieldKeyValue {
  name: string;
  title: string;
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldUniqueSettings',

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

    const rules = ref({
      type: 'array',
      required: true,
      defaultField: { type: 'array', required: true, min: 1 },
    });

    if (!settings.value) {
      settings.value = { ...defaultOptions };
    }

    settings.value = {
      ...defaultOptions,
      ...settings.value,
    };

    if (settings.value.validationGroups && settings.value.validationGroups.length === 0) {
      settings.value.validationGroups.push([]);
    }

    const handleAddValidationGroup = (): void => {
      settings.value.validationGroups.push([]);
    };

    const handleRemoveValidationGroup = (index: number): void => {
      settings.value.validationGroups.splice(index, 1);
    };

    const flattenFields = (
      fields: BaseField[],
      parent: FieldKeyValue | null = null,
    ): FieldKeyValue[] => {
      const fieldCollection: FieldKeyValue[] = [];

      fields.forEach(field => {
        let { name, title } = field;

        if (parent) {
          name = `${parent.name}.${name}`;
          title = `${parent.title} > ${title}`;
        }

        fieldCollection.push({ name, title });

        if (field.settings.children) {
          fieldCollection.push(...flattenFields(field.settings.children, { name, title }));
        }
      });

      return fieldCollection;
    };

    return () => {
      const fields = flattenFields(props.fields);

      return (
        <el-form-item
          label="Validation Groups"
          prop="settings.validationGroups"
          rules={rules.value}
        >
          {settings.value.validationGroups.map((_, index) => (
            <div class="flex items-center justify-between">
              <el-select
                v-model={settings.value.validationGroups[index]}
                class="w-full"
                multiple
                filterable
              >
                {fields.map(field => (
                  <el-option label={field.title} value={field.name} />
                ))}
              </el-select>

              <div class="pl-3">
                <el-button
                  disabled={settings.value.validationGroups.length <= 1}
                  type="text"
                  class="text-red-400 hover:text-red-500"
                  icon="el-icon-delete"
                  onClick={handleRemoveValidationGroup(index)}
                />
              </div>
            </div>
          ))}

          <div class="text-center">
            <el-button
              circle
              class="text-center"
              size="small"
              icon="el-icon-plus"
              onClick={handleAddValidationGroup}
            />
          </div>
        </el-form-item>
      );
    };
  },
});
