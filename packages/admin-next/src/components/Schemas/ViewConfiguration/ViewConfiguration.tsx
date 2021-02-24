import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaConfigurableView } from '@dockite/database';

export interface SchemaViewConfigurationComponentProps {
  modelValue: SchemaConfigurableView;
}

export const SchemaViewConfigurationComponent = defineComponent({
  name: 'SchemaViewConfigurationComponent',

  props: {
    modelValue: {
      type: Object as PropType<SchemaViewConfigurationComponentProps['modelValue']>,
    },
  },

  emits: ['update:modelValue', 'action:removeView'],

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaViewConfigurationComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const expanded = ref<string[]>([]);

    if (!modelValue.value.name) {
      expanded.value = ['expanded'];
    }

    return () => {
      return (
        <el-collapse v-model={expanded.value}>
          <el-collapse-item
            name="expanded"
            title={modelValue.value.name || 'Schema View Configuration Item'}
          >
            Hullo
          </el-collapse-item>
        </el-collapse>
      );
    };
  },
});
