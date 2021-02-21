import { Field } from '@dockite/database';
import { computed, defineComponent, PropType, reactive, ref } from 'vue';

import { SelectFieldOptionItem, SelectFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: SelectFieldSettings;
  groups: Record<string, string>;
  fields: Field[];
}

interface OptionsTableScopedSlot {
  row: SelectFieldOptionItem;
}

const BASE_OPTION_ITEM: SelectFieldOptionItem = {
  label: '',
  value: '',
};

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldSelectSettings',

  props: {
    modelValue: {
      type: Object as PropType<SettingsComponentProps['value']>,
      required: true,
    },

    groups: {
      type: Object as PropType<SettingsComponentProps['groups']>,
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

    const optionItem = reactive({ ...BASE_OPTION_ITEM });

    const error = ref('');

    if (!settings.value) {
      settings.value = { ...defaultOptions };
    }

    settings.value = {
      ...defaultOptions,
      ...settings.value,
    };

    const handleAddOption = (): void => {
      error.value = '';

      if (settings.value.options.find(x => x.label === optionItem.label)) {
        error.value = 'Label has already been used.';

        return;
      }

      if (!optionItem.label || !optionItem.value) {
        error.value = 'Both option label and option value must be provided.';

        return;
      }

      settings.value.options.push({ ...optionItem });

      Object.assign(optionItem, {
        ...BASE_OPTION_ITEM,
      });
    };

    const handleRemoveOption = (label: string): void => {
      settings.value.options = settings.value.options.filter(option => option.label !== label);
    };

    return (): JSX.Element => (
      <>
        <el-form-item label="Required">
          <el-switch v-model={settings.value.required} />

          <div class="el-form-item__description">
            Controls whether or not the field is required, if set to true the document will not be
            able to be saved without setting the field.
          </div>
        </el-form-item>

        <el-form-item label="Options" class={error.value ? 'is-error' : ''}>
          {settings.value.options && (
            <el-table
              style="border: 1px solid #dcdfe6; border-radius: 4px; margin-bottom: 0.5rem;"
              data={settings.value.options}
            >
              <el-table-column prop="label" label="Label" />

              <el-table-column prop="value" label="Value" />

              <el-table-column label="Action">
                {{
                  default: (scope: OptionsTableScopedSlot): JSX.Element => (
                    <el-button
                      type="text"
                      size="small"
                      onClick={() => handleRemoveOption(scope.row.label)}
                    >
                      <i class="el-icon-delete" />
                    </el-button>
                  ),
                }}
              </el-table-column>
            </el-table>
          )}

          <el-form model={optionItem} class="pt-3">
            <el-form-item label="Label" prop="label">
              <el-input v-model={optionItem.label} />
            </el-form-item>

            <el-form-item label="Value" prop="value">
              <el-input v-model={optionItem.value} />
            </el-form-item>

            <el-form-item>
              <el-button onClick={handleAddOption}>Add Option</el-button>
            </el-form-item>
          </el-form>
        </el-form-item>

        <div class="el-form-item__description">The options to display in the select field.</div>

        {error.value && <div class="el-form-item__error">{error.value}</div>}
      </>
    );
  },
});

export default SettingsComponent;
