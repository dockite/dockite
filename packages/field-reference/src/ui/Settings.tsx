import { cloneDeep } from 'lodash';
import { computed, defineComponent, inject, PropType, ref } from 'vue';

import { Schema } from '@dockite/database';
import { FindManyResult } from '@dockite/types';

import { defaultOptions, GraphQLResult, ReferenceFieldSettings } from '../types';

import { AllSchemasQueryResponse, ALL_SCHEMAS_QUERY } from './queries';

interface SettingsComponentProps {
  value: ReferenceFieldSettings;
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldReferenceSettings',

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

    const $graphql = inject<any>('$graphql');

    const schemas = ref<FindManyResult<Schema> | null>(null);

    if (!settings.value) {
      settings.value = { ...defaultOptions };
    }

    settings.value = {
      ...defaultOptions,
      ...settings.value,
    };

    const fetchSchemas = async (): Promise<void> => {
      const { data }: GraphQLResult<AllSchemasQueryResponse> = await $graphql.executeQuery({
        query: ALL_SCHEMAS_QUERY,
      });

      schemas.value = cloneDeep(data.allSchemas);
    };

    fetchSchemas();

    return (): JSX.Element => (
      <>
        <el-form-item label="Required">
          <el-switch v-model={settings.value.required} />
        </el-form-item>

        {schemas.value && (
          <el-form-item label="Referring Schemas">
            <el-select
              v-model={settings.value.schemaIds}
              multiple
              filterable
              style={{ width: '100%' }}
              placeholder="Select the Schemas that may referenced within the field"
            >
              <el-option label="Self" value="self" />

              {schemas.value.results.map(item => (
                <el-option label={item.title} value={item.id} />
              ))}
            </el-select>
          </el-form-item>
        )}
      </>
    );
  },
});

export default SettingsComponent;
