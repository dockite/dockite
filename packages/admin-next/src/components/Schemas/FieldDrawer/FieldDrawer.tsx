import { BaseField } from '@dockite/database';
import { computed, defineComponent, PropType, ref, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';

import { SchemaFieldSettingsFormComponent } from './FieldForm';
import { SchemaAvailableFieldsListComponent } from './FieldList';

import { getAvailableFields } from '~/common/api';
import { BaseSchema } from '~/common/types';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { AvailableFieldItem } from '~/graphql';

export interface SchemaFieldDrawerComponentProps {
  modelValue: boolean;
  schema: BaseSchema;
}

export const SchemaFieldDrawerComponent = defineComponent({
  name: 'SchemaFieldDrawerComponent',

  props: {
    modelValue: {
      type: Boolean as PropType<SchemaFieldDrawerComponentProps['modelValue']>,
    },

    schema: {
      type: Object as PropType<SchemaFieldDrawerComponentProps['schema']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaFieldDrawerComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const availableFields = usePromise(() => getAvailableFields());

    const field = ref<Omit<BaseField, 'id' | 'schemaId'> | null>(null);

    const staticField = ref<AvailableFieldItem | null>(null);

    const handleConfirmField = (payload: BaseField): void => {
      ctx.emit('action:confirmField', payload);

      field.value = null;

      staticField.value = null;
    };

    const handleCancelField = (): void => {
      field.value = null;

      staticField.value = null;
    };

    const handleFieldSelected = (selectedField: AvailableFieldItem): void => {
      field.value = {
        name: '',
        title: '',
        type: selectedField.type,
        description: '',
        settings: {},
      };

      staticField.value = selectedField;
    };

    return () => {
      return (
        <el-drawer
          v-model={modelValue.value}
          appendToBody={true}
          size={400}
          onClose={handleCancelField}
        >
          {{
            title: () => <span class="text-lg">Add a Field</span>,
            default: () => {
              if (availableFields.loading.value) {
                return (
                  <div class="el-loading-mask">
                    <div class="el-loading-spinner">
                      <SpinnerComponent />

                      <p class="el-loading-text">Fields are still loading, please wait...</p>
                    </div>
                  </div>
                );
              }

              if (!availableFields.result.value || availableFields.error.value) {
                return (
                  <div class="px-3">
                    <el-alert title="Failed to load fields" type="error" showIcon closable={false}>
                      <span class="block pb-2">
                        An error occurred while fetching the available fields.
                      </span>

                      <a
                        href="#"
                        class="font-semibold"
                        onClick={withModifiers(() => availableFields.exec(), ['prevent'])}
                      >
                        Retry?
                      </a>
                    </el-alert>
                  </div>
                );
              }

              if (!staticField.value) {
                return (
                  <SchemaAvailableFieldsListComponent
                    availableFields={availableFields.result.value}
                    {...{ 'onSelected:field': handleFieldSelected }}
                  />
                );
              }

              return (
                <SchemaFieldSettingsFormComponent
                  v-model={field.value}
                  staticField={staticField.value}
                  schema={props.schema}
                  {...{
                    'onAction:confirmField': handleConfirmField,
                    'onAction:cancelField': handleCancelField,
                  }}
                />
              );
            },
          }}
        </el-drawer>
      );
    };
  },
});
