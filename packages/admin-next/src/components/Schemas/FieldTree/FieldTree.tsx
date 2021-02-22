import { BaseField, Field } from '@dockite/database';
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { SchemaFieldDrawerComponent } from '../FieldDrawer';

import { FieldTreeItem } from './types';
import {
  buildSchemaFieldTree,
  getFieldsFromSchemaFieldTree,
  handleAddGroup,
  handleRemoveGroup,
} from './util';

import { BaseSchema } from '~/common/types';
import { getFieldsByGroup } from '~/utils';

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

    const schemaFieldTree = ref<Record<string, FieldTreeItem[]>>({});

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

    onBeforeMount(() => {
      Object.keys(modelValue.value.groups).forEach(group => {
        schemaFieldTree.value[group] = buildSchemaFieldTree(
          getFieldsByGroup(group, modelValue.value),
        );
      });
    });

    /**
     * Watch the schema field tree for changes which will then be applied to the parent
     * schema.
     */
    const updateSchemaToReflectSchemaFieldTree = (): void => {
      const fields: BaseField[] = [];

      const groups: Record<string, string[]> = {};

      Object.entries(schemaFieldTree.value).forEach(([group, fieldTree]) => {
        const fieldsFromFieldTree = getFieldsFromSchemaFieldTree(fieldTree);

        groups[group] = fieldsFromFieldTree.map(field => field.name);

        fields.push(...fieldsFromFieldTree);
      });

      modelValue.value.groups = groups;

      modelValue.value.fields = fields as Field[];
    };

    const handleShowFieldDrawer = (): void => {
      fieldDrawerVisible.value = true;
    };

    const handleAddField = (field: BaseField): void => {
      // If the group exists within the field tree
      if (schemaFieldTree.value[activeTab.value]) {
        // Add the new field to the groups tree
        schemaFieldTree.value[activeTab.value] = [
          ...schemaFieldTree.value[activeTab.value],
          {
            _field: field,
            title: field.title,
            type: field.type,
            // We should never encounter a situation where children isn't an empty array
            // but we will still run it through the tree building method for safety.
            children: field.settings.children
              ? buildSchemaFieldTree(field.settings.children)
              : undefined,
          },
        ];

        updateSchemaToReflectSchemaFieldTree();
      }
    };

    const getFieldNodeComponent = (
      _: never,
      { data: treeItem }: { data: FieldTreeItem },
    ): JSX.Element => {
      return (
        // We don't need pl-3 since there is already padding applied
        <div
          class="dockite-schema--field-tree__node w-full border-b py-2 pr-3 flex items-center justify-between"
          // The width of the dropdown icon
          style={{ marginLeft: '-24px', paddingLeft: '24px' }}
        >
          <span>{treeItem.title}</span>

          <el-tag size="mini">{treeItem.type}</el-tag>
        </div>
      );
    };

    return () => {
      const panes = Object.keys(schemaFieldTree.value).map(key => (
        <el-tab-pane name={key} label={key}>
          <el-tree
            data={schemaFieldTree.value[key]}
            emptyText="There's currently no fields"
            nodeKey="id"
            defaultExpandAll
            draggable
            renderContent={getFieldNodeComponent}
            onNodeDrop={() => updateSchemaToReflectSchemaFieldTree()}
            props={{ label: 'title', children: 'children' }}
          />

          <div class="flex justify-center pt-3">
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
            onTabAdd={() => handleAddGroup(schemaFieldTree, activeTab)}
            onTabRemove={(groupName: string) =>
              handleRemoveGroup(groupName, schemaFieldTree, activeTab)
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
