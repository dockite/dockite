import { BaseField, Schema } from '@dockite/database';
import { ElMessage } from 'element-plus';
import { camelCase } from 'lodash';
import { computed, defineComponent, PropType, ref, toRaw, toRefs, watch } from 'vue';

import { fieldSettingsFormRules, getIdentifierUniqueFormRule } from './formRules';

import { BaseSchema } from '~/common/types';
import { useDockite } from '~/dockite';
import { AvailableFieldItem as StaticDockiteField } from '~/graphql';

import './FieldForm.scss';

export interface SchemaFieldSettingsFormComponentProps {
  modelValue: BaseField;
  schema: BaseSchema;
  staticField: StaticDockiteField;
}

export const SchemaFieldSettingsFormComponent = defineComponent({
  name: 'SchemaFieldSettingsFormComponent',

  props: {
    modelValue: {
      type: Object as PropType<SchemaFieldSettingsFormComponentProps['modelValue']>,
    },

    schema: {
      type: Object as PropType<SchemaFieldSettingsFormComponentProps['schema']>,
      required: true,
    },

    staticField: {
      type: Object as PropType<SchemaFieldSettingsFormComponentProps['staticField']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaFieldSettingsFormComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const form = ref<any>(null);

    const isManuallyEditingIdentifier = ref(false);

    const { staticField } = toRefs(props);

    const { fieldManager } = useDockite();

    if (!fieldManager[staticField.value.type]) {
      throw new Error('something');
    }

    let SettingsComponent = fieldManager[staticField.value.type].settings;

    if (SettingsComponent) {
      SettingsComponent = toRaw(SettingsComponent);
    }

    watch(
      () => modelValue.value.title,
      () => {
        if (!isManuallyEditingIdentifier.value) {
          modelValue.value.name = camelCase(modelValue.value.title);
        }
      },
    );

    const handleEditIdentifier = (): void => {
      isManuallyEditingIdentifier.value = true;
    };

    const handleIdentifierBlur = (): void => {
      if (isManuallyEditingIdentifier.value) {
        isManuallyEditingIdentifier.value = false;
      }
    };

    const handleConfirmField = (): void => {
      if (form.value) {
        form.value
          .validate()
          .then(() => {
            ctx.emit('action:confirmField', modelValue.value);
          })
          .catch((err: any) => {
            console.log(err);
            ElMessage.warning('Unable to confirm field due to errors with its configuration');
          });
      }
    };

    const handleCancelField = (): void => {
      ctx.emit('action:cancelField');
    };

    return () => (
      <div class="dockite-field-settings--form px-3">
        <el-form ref={form} model={modelValue.value} labelPosition="top">
          <el-form-item label="Title" prop="title" rules={fieldSettingsFormRules.title}>
            <el-input v-model={modelValue.value.title} />

            <div class="el-form-item__description">
              The cosmetic title for the field. This will be used for display throughout the Admin
              UI.
            </div>
          </el-form-item>

          <el-form-item
            label="Identifier"
            prop="name"
            rules={[...fieldSettingsFormRules.name, getIdentifierUniqueFormRule(props.schema)]}
          >
            <el-input
              v-model={modelValue.value.name}
              disabled={!isManuallyEditingIdentifier.value}
              onBlur={handleIdentifierBlur}
            />

            <div class="flex justify-between items-start -mx-2">
              <div class="el-form-item__description flex-1 px-2">
                The API identifier for the field. Must only contain letters, numbers, and
                underscores.
              </div>

              <div class="px-2">
                <el-button type="text" size="mini" onClick={handleEditIdentifier}>
                  Edit Identifier
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="Description" prop="description">
            <el-input
              type="textarea"
              autosize={{ minRows: 3, maxRows: 10 }}
              v-model={modelValue.value.description}
            />

            <div class="el-form-item__description">
              The description for the field. This will be displayed underneath the field on forms.
            </div>
          </el-form-item>

          {SettingsComponent && (
            <SettingsComponent
              v-model={modelValue.value.settings}
              fields={props.schema.fields}
              groups={props.schema.groups}
              schema={props.schema as Schema}
            />
          )}

          <el-form-item>
            <div class="flex justify-between items-center">
              <el-button type="text" onClick={() => handleCancelField()}>
                Cancel
              </el-button>

              <el-button type="primary" onClick={() => handleConfirmField()}>
                Confirm
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    );
  },
});
