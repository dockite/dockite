import { computed, defineComponent, PropType, ref } from 'vue';

import { SchemaConfigurableView } from '@dockite/database';

import { CollapsableComponent } from '~/components/Common/Collapsable';

import './ViewConfiguration.scss';

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

    const expanded = ref(false);

    if (!modelValue.value.name) {
      expanded.value = true;
    }

    return () => {
      return (
        <CollapsableComponent
          class="view-configuration--item"
          v-model={expanded.value}
          title={modelValue.value.name || 'Schema View Configuration Item'}
        >
          <el-form model={modelValue.value}>
            <el-form-item label="Name" prop="name" required>
              <el-input v-model={modelValue.value.name} />
            </el-form-item>

            <el-form-item label="Type" prop="type" required>
              <el-select v-model={modelValue.value.type} class="w-full">
                <el-option label="Table View" value="table" />
                <el-option label="Tree View" value="tree" />
                <el-option label="Grid View" value="grid" />
              </el-select>
            </el-form-item>
          </el-form>
        </CollapsableComponent>
      );
    };
  },
});
