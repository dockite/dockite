import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaConfigurableView } from '@dockite/database';
import { SchemaType } from '@dockite/types';

import SchemaConstraintBuilderComponent from '../ContraintBuilder';

import { baseFormRules } from './formRules';
import { SchemaViewConfigurationComponentProps } from './types';
import { getViewSettingsForm } from './util';

import { CollapsableComponent } from '~/components/Common/Collapsable';

import './ViewConfiguration.scss';

export const SchemaViewConfigurationComponent = defineComponent({
  name: 'SchemaViewConfigurationComponent',

  props: {
    modelValue: {
      type: Object as PropType<SchemaViewConfigurationComponentProps['modelValue']>,
    },

    schema: {
      type: Object as PropType<SchemaViewConfigurationComponentProps['schema']>,
      required: true,
    },
  },

  emits: ['update:modelValue', 'action:removeView'],

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaViewConfigurationComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const schemaType = computed(() =>
      props.schema.type === SchemaType.DEFAULT ? 'Schema' : 'Singleton',
    );

    const viewType = computed(() => {
      switch (modelValue.value.type) {
        case 'table':
          return 'Table View';

        case 'tree':
          return 'Tree View';

        case 'grid':
          return 'Grid View';

        default:
          return 'Unknown View';
      }
    });

    const expanded = ref(false);

    const advancedMode = ref(false);

    if (!modelValue.value.name) {
      expanded.value = true;
    }

    if (modelValue.value.constraints) {
      advancedMode.value = true;
    }

    const uniqueViewNameRule = {
      message: 'Name must be unique across views',
      trigger: 'blur',
      validator: async (_: never, value: string): Promise<void> => {
        const matched = props.schema.settings.views.filter(view => view.name === value);

        if (matched.length > 1) {
          throw new Error('View name has been used multiple times');
        }
      },
    };

    const handleSelectViewType = (type: SchemaConfigurableView['type']): void => {
      modelValue.value.type = type;
    };

    const handleRemoveView = (): void => {
      ctx.emit('action:removeView');
    };

    const handleToggleAdvancedMode = (): void => {
      advancedMode.value = !advancedMode.value;
    };

    return () => {
      if (!modelValue.value.type) {
        return (
          <>
            <div class="flex items-center justify-between -mx-3 py-3">
              <div class="w-1/3 px-3">
                <div
                  class="p-3 border rounded hover:bg-gray-200"
                  role="button"
                  onClick={() => handleSelectViewType('table')}
                >
                  <h3 class="font-semibold pb-2">Table View</h3>

                  <p class="text-sm">
                    A general-purpose view with filtering and sorting options. Ideal for documents
                    that will regularly need to be filtered.
                  </p>
                </div>
              </div>

              <div class="w-1/3 px-3">
                <div
                  class="p-3 border rounded hover:bg-gray-200"
                  role="button"
                  onClick={() => handleSelectViewType('tree')}
                >
                  <h3 class="font-semibold pb-2">Tree View</h3>

                  <p class="text-sm">
                    A tree-based view for ordering documents in a hierarchical fashion. Ideal for
                    documents that have an explicit parent-child relationship.
                  </p>
                </div>
              </div>

              <div class="w-1/3 px-3">
                <div
                  class="p-3 border rounded hover:bg-gray-200"
                  role="button"
                  onClick={() => handleSelectViewType('grid')}
                >
                  <h3 class="font-semibold pb-2">Grid View</h3>

                  <p class="text-sm">
                    A grid-based view for viewing documents as cards. Ideal for documents where
                    image content is the primary method of identification.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex justify-between flex-row-reverse -mt-2">
              <el-button type="text" size="small" onClick={() => handleRemoveView()}>
                Cancel
              </el-button>
            </div>
          </>
        );
      }

      return (
        <CollapsableComponent
          class="view-configuration--item"
          v-model={expanded.value}
          title={modelValue.value.name || 'Schema View Configuration Item'}
          extra={viewType.value}
        >
          <el-form model={modelValue.value}>
            <el-form-item
              label="Name"
              prop="name"
              rules={[...baseFormRules.name, uniqueViewNameRule]}
            >
              <el-input v-model={modelValue.value.name} />

              <div class="el-form-item__description">
                The name for the view. This will be displayed as the label for the dropdown option
                when viewing the {schemaType.value}'s documents.
              </div>
            </el-form-item>

            {getViewSettingsForm(modelValue, props.schema, schemaType.value)}

            <div class="pb-3">
              <el-button type="text" size="mini" onClick={() => handleToggleAdvancedMode()}>
                {advancedMode.value ? 'Hide' : 'Show'} Advanced Options
              </el-button>
            </div>

            {advancedMode.value && modelValue.value.type !== 'tree' && (
              <el-form-item label="Constraints" prop="constraints">
                <SchemaConstraintBuilderComponent
                  v-model={modelValue.value.constraints}
                  schema={props.schema}
                />
              </el-form-item>
            )}

            <div class="flex justify-between flex-row-reverse">
              <el-button
                type="text"
                size="small"
                class="hover:opacity-75"
                onClick={() => handleRemoveView()}
              >
                <span class="text-red-600">Remove View</span>
              </el-button>
            </div>
          </el-form>
        </CollapsableComponent>
      );
    };
  },
});

export default SchemaViewConfigurationComponent;
