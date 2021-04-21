import { computed, defineComponent, PropType } from 'vue';

import { WebhookConstraint } from '@dockite/database';

import { WebhookOperators, WebhookSupportedOperators } from './types';

export interface WebhookConstraintBuilderComponent {
  modelValue: WebhookConstraint[];
}

// console.log({ WebhookOperators });

export const WebhookConstraintBuilderComponent = defineComponent({
  name: 'WebhookConstraintBuilderComponent',

  props: {
    modelValue: {
      type: Array as PropType<WebhookConstraintBuilderComponent['modelValue']>,
    },
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue || [],
      set: value => ctx.emit('update:modelValue', value),
    });

    const handleAddConstraint = (): void => {
      modelValue.value.push({
        name: '',
        operator: '$eq',
        value: '',
      });
    };

    const handleRemoveConstraint = (index: number): void => {
      modelValue.value.splice(index, 1);
    };

    return () => {
      return (
        <div class="p-3 border border-dashed rounded">
          <div>
            {modelValue.value.map((constraint, index) => (
              <div class="flex items-center w-full -mx-2 mb-3 last:mb-0">
                <div class="px-2 flex-1">
                  <el-input v-model={constraint.name} placeholder="Record Key" />
                </div>

                <div class="px-2" style={{ maxWidth: '200px' }}>
                  <el-select v-model={constraint.operator} filterable>
                    {WebhookSupportedOperators.map(operator => (
                      <el-option label={operator} value={operator} />
                    ))}
                  </el-select>
                </div>

                <div class="px-2 flex-1">
                  <el-input v-model={constraint.value} placeholder="Record Value" />
                </div>

                <div class="px-2">
                  <el-button type="text" onClick={() => handleRemoveConstraint(index)}>
                    <i class="el-icon-delete text-red-400" />
                  </el-button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <el-button onClick={handleAddConstraint}>Add Constraint</el-button>

            <span class="px-3">
              <el-tooltip appendToBody placement="top">
                {{
                  default: () => <i class="el-icon-question" />,
                  content: () => (
                    <div>
                      {Object.entries(WebhookOperators).map(([name, desc]) => (
                        <span class="block">
                          <strong>{name}:</strong> {desc}
                        </span>
                      ))}
                    </div>
                  ),
                }}
              </el-tooltip>
            </span>
          </div>
        </div>
      );
    };
  },
});

export default WebhookConstraintBuilderComponent;
