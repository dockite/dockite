import { defineComponent, PropType, computed } from 'vue';
import { Field } from '@dockite/database';

import { ConditionalBooleanFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: ConditionalBooleanFieldSettings;
  groups: Record<string, string>;
  fields: Field[];
}

export const SettingsComponent = defineComponent({
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

    if (!settings.value) {
      settings.value = { ...defaultOptions };
    }

    settings.value = {
      ...defaultOptions,
      ...settings.value,
    };

    const allFields = computed(() => {
      const allFieldNames = Object.values(props.groups).reduce(
        (acc: string[], curr) => [...acc, ...curr],
        [],
      );

      return props.fields.filter(field => allFieldNames.includes(field.name));
    });

    const fieldOptionElements = allFields.value.map(field => (
      <el-option key={field.name} label={field.title} value={field.name} />
    ));

    const groupOptionElements = Object.keys(props.groups).map(group => (
      <el-option key={group} label={group} value={group} />
    ));

    return (): JSX.Element => (
      <>
        <el-form-item label="Required">
          <el-switch v-model={settings.value.required} />
        </el-form-item>

        <el-form-item label="Fields to Hide">
          <el-select
            v-model={settings.value.fieldsToHide}
            multiple
            filterable
            placeholder="Fields to Hide"
            class="w-full mb-2"
          >
            {fieldOptionElements}
          </el-select>
        </el-form-item>

        <el-form-item label="Groups to Hide">
          <el-select
            v-model={settings.value.groupsToHide}
            multiple
            filterable
            placeholder="Groups to Hide"
            class="w-full mb-2"
          >
            {groupOptionElements}
          </el-select>
        </el-form-item>

        <el-form-item label="Fields to Show">
          <el-select
            v-model={settings.value.fieldsToShow}
            multiple
            filterable
            placeholder="Fields to Show"
            class="w-full mb-2"
          >
            {fieldOptionElements}
          </el-select>
        </el-form-item>

        <el-form-item label="Groups to Show">
          <el-select
            v-model={settings.value.groupsToShow}
            multiple
            filterable
            placeholder="Groups to Show"
            class="w-full mb-2"
          >
            {groupOptionElements}
          </el-select>
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
