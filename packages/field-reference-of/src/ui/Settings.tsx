import { Schema, Field } from '@dockite/database';
import { FindManyResult } from '@dockite/types';
import { cloneDeep } from 'lodash';
import { computed, defineComponent, inject, PropType, ref, onBeforeMount } from 'vue';

import { defaultOptions, GraphQLResult, ReferenceOfFieldSettings, FIELD_TYPE } from '../types';

import { AllSchemasQueryResponse, ALL_SCHEMAS_QUERY } from './queries';

interface SettingsComponentProps {
  value: ReferenceOfFieldSettings;
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldReferenceOfSettings',

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

    const fields = computed<Field[]>(() => {
      if (schemas.value && settings.value.schemaId) {
        const schema = schemas.value.results.find(s => s.id === settings.value.schemaId);

        if (schema) {
          return schema.fields.filter(
            field => field.type.includes('reference') && field.type !== FIELD_TYPE,
          );
        }
      }

      return [];
    });

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

    onBeforeMount(() => {
      fetchSchemas();
    });

    return (): JSX.Element => {
      if (schemas.value) {
        return (
          <>
            <el-form-item label="Referring Schema">
              <el-select
                v-model={settings.value.schemaId}
                filterable
                style={{ width: '100%' }}
                placeholder="Select the Schemas that may be referenced within the field"
              >
                <el-option label="Self" value="self" />

                {schemas.value.results.map(item => (
                  <el-option label={item.title} value={item.id} />
                ))}
              </el-select>
            </el-form-item>

            <el-form-item label="Field">
              <el-select
                v-model={settings.value.fieldName}
                filterable
                style={{ width: '100%' }}
                placeholder="Select the Reference field to be used to gather Documents"
              >
                {fields.value.map(field => (
                  <el-option label={field.title} value={field.name} />
                ))}
              </el-select>
            </el-form-item>
          </>
        );
      }

      return <></>;
    };
  },
});

export default SettingsComponent;
