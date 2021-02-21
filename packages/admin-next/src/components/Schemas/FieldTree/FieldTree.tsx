import { BaseField, Field } from '@dockite/database';
import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaFieldDrawerComponent } from '../FieldDrawer';

import { getFieldTreeForGroup, handleAddGroup, handleRemoveGroup } from './util';

import { BaseSchema } from '~/common/types';

import './FieldTree.scss';

export interface SchemaFieldTreeComponentProps {
  modelValue: BaseSchema;
}

export const SchemaFieldTreeComponent = defineComponent({
  name: 'SchemaFieldTreeComponent',

  props: {
    modelValue: Object as PropType<SchemaFieldTreeComponentProps['modelValue']>,
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaFieldTreeComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const activeTab = ref('');

    const fieldDrawerVisible = ref(true);

    const groups = computed<Record<string, string[]>>(() => props.modelValue!.groups);

    const groupNames = computed(() => Object.keys(groups.value));

    if (groupNames.value.length > 0) {
      [activeTab.value] = groupNames.value;
    }

    if (groupNames.value.length === 0) {
      modelValue.value.groups = {
        General: [],
      };

      activeTab.value = 'General';
    }

    const handleShowFieldDrawer = (): void => {
      fieldDrawerVisible.value = true;
    };

    const handleAddField = (field: BaseField): void => {
      // If the group exists
      if (modelValue.value.groups[activeTab.value]) {
        // Add the field to the schema's fields
        modelValue.value.fields = [...modelValue.value.fields, field as Field];

        // Add the new field to the group
        modelValue.value.groups[activeTab.value] = [
          ...modelValue.value.groups[activeTab.value],
          field.name,
        ];
      }
    };

    return () => {
      const panes = Object.keys(groups.value).map(key => (
        <el-tab-pane name={key} label={key}>
          <el-tree
            data={getFieldTreeForGroup(groups.value[key], modelValue.value.fields)}
            empty-text="There's currently no fields"
            node-key="id"
            default-expand-all
            draggable
            props={{ label: 'title', children: (d: BaseField) => d.settings.children }}
          />

          <div class="flex justify-center">
            <el-button class="el-button--dashed" onClick={handleShowFieldDrawer}>
              Add Field
              <i class="el-icon-plus el-icon--right" />
            </el-button>
          </div>
        </el-tab-pane>
      ));

      return (
        <div class="dockite-schema--field-tree">
          <el-tabs
            v-model={activeTab.value}
            type="border-card"
            editable
            onTabAdd={() => handleAddGroup(modelValue, activeTab, groups.value)}
            onTabRemove={(groupName: string) =>
              handleRemoveGroup(groupName, modelValue, activeTab, groups.value)
            }
          >
            {panes}
          </el-tabs>

          <SchemaFieldDrawerComponent
            v-model={fieldDrawerVisible.value}
            schema={modelValue.value}
            {...{ 'onAction:confirmField': handleAddField }}
          />
        </div>
      );
    };
  },
});

export default SchemaFieldTreeComponent;
