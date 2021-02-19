import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaFieldDrawerComponent } from '../FieldDrawer';

import { handleAddGroup, handleRemoveGroup } from './util';

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

    const groups = computed<Record<string, string[]>>(() => modelValue.value.groups);

    const groupNames = computed(() => Object.keys(groups.value));

    if (groupNames.value.length > 0) {
      activeTab.value = groupNames.value[0].toLowerCase();
    }

    if (groupNames.value.length === 0) {
      modelValue.value.groups = {
        General: [],
      };

      activeTab.value = 'general';
    }

    const handleShowFieldDrawer = (): void => {
      fieldDrawerVisible.value = true;
    };

    return () => {
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
            {Object.entries(groups.value).map(([key, value]) => (
              <el-tab-pane name={key.toLowerCase()} label={key}>
                {value}

                <div class="flex justify-center">
                  <el-button type="dashed" onClick={handleShowFieldDrawer}>
                    Add Field
                    <i class="el-icon-plus el-icon--right" />
                  </el-button>
                </div>
              </el-tab-pane>
            ))}
          </el-tabs>

          <SchemaFieldDrawerComponent
            v-model={fieldDrawerVisible.value}
            schema={modelValue.value}
          />
        </div>
      );
    };
  },
});

export default SchemaFieldTreeComponent;
