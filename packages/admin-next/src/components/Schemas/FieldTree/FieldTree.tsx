import { computed, defineComponent, PropType, ref } from 'vue';

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

    const groups = computed<Record<string, string[]>>(() => modelValue.value.groups);

    const groupNames = computed(() => Object.keys(groups.value));

    if (groupNames.value.length > 0) {
      activeTab.value = groupNames.value[0].toLowerCase();
    }

    if (groupNames.value.length === 0) {
      modelValue.value.groups = {
        General: [],
        Dummy: [],
      };

      activeTab.value = 'general';
    }

    return () => {
      return (
        <div class="dockite-schema--field-tree">
          <el-tabs v-model={activeTab.value} type="border-card" editable>
            {Object.entries(groups.value).map(([key, value]) => (
              <el-tab-pane name={key.toLowerCase()} label={key} />
            ))}
          </el-tabs>
        </div>
      );
    };
  },
});

export default SchemaFieldTreeComponent;
