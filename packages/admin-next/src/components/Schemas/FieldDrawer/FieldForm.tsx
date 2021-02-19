import { BaseField, Schema } from '@dockite/database';
import { computed, defineComponent, markRaw, PropType, toRaw, toRefs } from 'vue';

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

    const { staticField } = toRefs(props);

    const { fieldManager } = useDockite();

    if (!fieldManager[staticField.value.type]) {
      throw new Error('something');
    }

    let SettingsComponent = fieldManager[staticField.value.type].settings;

    if (SettingsComponent) {
      SettingsComponent = toRaw(SettingsComponent);
    }

    const handleCancelField = (): void => {
      ctx.emit('action:cancelField');
    };

    return () => (
      <div class="dockite-field-settings--form px-3">
        <el-form model={modelValue.value} labelPosition="top">
          <el-form-item label="Title" prop="title">
            <el-input v-model={modelValue.value.title} />
          </el-form-item>

          <el-form-item label="Identifier" prop="name">
            <el-input v-model={modelValue.value.name} />
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

              <el-button type="primary">Confirm</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    );
  },
});
