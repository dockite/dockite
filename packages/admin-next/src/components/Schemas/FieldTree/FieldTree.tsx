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

    const treeEl = ref<any>(null);

    const activeTab = ref('');

    const fieldDrawerVisible = ref(true);

    const fieldTreeItemToBeEdited = ref<FieldTreeItem | null>(null);

    const fieldToBeEdited = computed(() => {
      if (fieldTreeItemToBeEdited.value) {
        // eslint-disable-next-line no-underscore-dangle
        return fieldTreeItemToBeEdited.value._field;
      }
    });

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
        // A pseudo-random ID for identifying tree nodes
        const id = Math.random()
          .toString(36)
          .slice(2);

        // Add the new field to the groups tree
        schemaFieldTree.value[activeTab.value] = [
          ...schemaFieldTree.value[activeTab.value],
          {
            id,
            title: field.title,
            type: field.type,
            _field: field,
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

    const handleSelectFieldForEditing = (fieldTreeItem: FieldTreeItem): void => {
      fieldTreeItemToBeEdited.value = fieldTreeItem;

      fieldDrawerVisible.value = true;
    };

    const handleRemoveField = (fieldTreeItem: FieldTreeItem): void => {
      if (treeEl.value) {
        treeEl.value.remove(fieldTreeItem);

        updateSchemaToReflectSchemaFieldTree();
      }
    };

    const handleUpdateField = (field: BaseField): void => {
      if (fieldTreeItemToBeEdited.value) {
        fieldTreeItemToBeEdited.value.title = field.title;

        // eslint-disable-next-line no-underscore-dangle
        fieldTreeItemToBeEdited.value._field = field;
      }

      fieldTreeItemToBeEdited.value = null;

      fieldDrawerVisible.value = false;

      updateSchemaToReflectSchemaFieldTree();
    };

    const handleCancelUpdateField = (): void => {
      fieldTreeItemToBeEdited.value = null;

      fieldDrawerVisible.value = false;
    };

    const handleCanDropNode = (
      _: never,
      node: { data: FieldTreeItem },
      type: 'prev' | 'inner' | 'next',
    ): boolean => {
      const { _field: field } = node.data;

      // If we're attempting to drop a field within a field.
      if (type === 'inner') {
        // The field must have a children setting that is an Array as this is the defacto method of
        // containing sub-fields.
        return field.settings.children && Array.isArray(field.settings.children);
      }

      return true;
    };

    const getFieldNodeComponent = (
      _: never,
      { data: treeItem }: { data: FieldTreeItem },
    ): JSX.Element => {
      return (
        // We don't need pl-3 since there is already padding applied
        <div
          class="dockite-schema--field-tree__node w-full border-b pr-3 flex items-center justify-between"
          // The width of the dropdown icon
          style={{ height: '40px', marginLeft: '-24px', paddingLeft: '24px' }}
        >
          <span>{treeItem.title}</span>

          <div class="flex items-center -mx-1">
            <span class="px-1">
              <el-tag title="Field Type" size="mini">
                {treeItem.type}
              </el-tag>
            </span>

            <span class="px-1">
              <el-button
                title="Edit Field"
                type="text"
                size="small"
                onClick={() => handleSelectFieldForEditing(treeItem)}
              >
                <i class="el-icon-edit-outline" />
              </el-button>
            </span>

            <span class="px-1">
              <el-popconfirm
                title="Are you sure you want to delete this field?"
                confirmButtonText="Confirm"
                cancelButtonText="Cancel"
                onConfirm={() => handleRemoveField(treeItem)}
              >
                {{
                  reference: () => (
                    <el-button title="Delete Field" type="text" size="small">
                      <i class="el-icon-delete" />
                    </el-button>
                  ),
                }}
              </el-popconfirm>
            </span>
          </div>
        </div>
      );
    };

    return () => {
      const panes = Object.keys(schemaFieldTree.value).map(key => (
        <el-tab-pane name={key} label={key}>
          <el-tree
            ref={treeEl}
            data={schemaFieldTree.value[key]}
            emptyText="There's currently no fields"
            nodeKey="id"
            defaultExpandAll
            draggable
            renderContent={getFieldNodeComponent}
            onNodeDrop={() => updateSchemaToReflectSchemaFieldTree()}
            allowDrop={handleCanDropNode}
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
        <div class="dockite-schema--field-tree pb-3">
          <el-tabs
            v-model={activeTab.value}
            type="border-card"
            editable
            onTabAdd={() =>
              handleAddGroup(schemaFieldTree, activeTab).then(() =>
                updateSchemaToReflectSchemaFieldTree(),
              )
            }
            onTabRemove={(groupName: string) =>
              handleRemoveGroup(groupName, schemaFieldTree, activeTab).then(() =>
                updateSchemaToReflectSchemaFieldTree(),
              )
            }
          >
            {panes}
          </el-tabs>

          <SchemaFieldDrawerComponent
            v-model={fieldDrawerVisible.value}
            schema={modelValue.value}
            fieldToBeEdited={fieldToBeEdited.value}
            {...{
              'onAction:confirmField': handleAddField,
              'onAction:cancelFieldToBeEdited': handleCancelUpdateField,
              'onUpdate:fieldToBeEdited': handleUpdateField,
            }}
          />
        </div>
      );
    };
  },
});

export default SchemaFieldTreeComponent;
