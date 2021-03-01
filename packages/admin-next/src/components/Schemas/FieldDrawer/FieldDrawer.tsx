import { cloneDeep } from 'lodash';
import { computed, defineComponent, PropType, ref, watch, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';

import { BaseField } from '@dockite/database';

import { SchemaFieldSettingsFormComponent } from './FieldForm';
import { SchemaAvailableFieldsListComponent } from './FieldList';

import { getAvailableFields } from '~/common/api';
import { BaseSchema } from '~/common/types';
import { SpinnerComponent } from '~/components/Common/Spinner';
import { AvailableFieldItem } from '~/graphql';

export interface SchemaFieldDrawerComponentProps {
  modelValue: boolean;
  fieldToBeEdited: BaseField | null;
  schema: BaseSchema;
}

export const SchemaFieldDrawerComponent = defineComponent({
  name: 'SchemaFieldDrawerComponent',

  props: {
    modelValue: {
      type: Boolean as PropType<SchemaFieldDrawerComponentProps['modelValue']>,
    },

    fieldToBeEdited: {
      type: (null as any) as PropType<SchemaFieldDrawerComponentProps['fieldToBeEdited']>,
    },

    schema: {
      type: Object as PropType<SchemaFieldDrawerComponentProps['schema']>,
      required: true,
    },
  },

  emits: [
    'update:modelValue',
    'update:fieldToBeEdited',
    'action:confirmField',
    'action:cancelFieldToBeEdited',
  ],

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaFieldDrawerComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const availableFields = usePromise(() => getAvailableFields());

    const field = ref<Omit<BaseField, 'id' | 'schemaId'> | null>(null);

    const staticField = ref<AvailableFieldItem | null>(null);

    const handleConfirmField = (payload: BaseField): void => {
      // Emit a v-model compatible event if we're editing a field, otherwise emit the
      // general field addition event.
      if (props.fieldToBeEdited) {
        ctx.emit('update:fieldToBeEdited', payload);
      } else {
        ctx.emit('action:confirmField', payload);
      }

      field.value = null;

      staticField.value = null;
    };

    const handleCancelField = (): void => {
      if (props.fieldToBeEdited) {
        ctx.emit('action:cancelFieldToBeEdited');
      }

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

    watch([props, availableFields.result], () => {
      if (props.fieldToBeEdited && availableFields.result.value) {
        const { fieldToBeEdited } = props;

        const staticFieldForField = availableFields.result.value.find(
          availableField => availableField.type === fieldToBeEdited.type,
        );

        if (!staticFieldForField) {
          return;
        }

        field.value = cloneDeep(fieldToBeEdited);

        staticField.value = staticFieldForField;
      }
    });

    return () => {
      return (
        <el-drawer
          v-model={modelValue.value}
          appendToBody={true}
          size={400}
          onClose={handleCancelField}
        >
          {{
            title: () => (
              <span class="text-lg">
                {staticField.value ? `${staticField.value.title} Field Settings` : 'Add a Field'}
              </span>
            ),
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
