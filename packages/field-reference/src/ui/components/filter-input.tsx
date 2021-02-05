import { Operators, Constraint } from '@dockite/where-builder';
import { computed, defineComponent, onMounted, PropType, ref, watchEffect } from 'vue';

import './filter-input.scss';

export interface FilterInputComponentProps {
  prop: string;
  options: typeof Operators;
  value: Constraint | null;
}

export const FilterInputComponent = defineComponent({
  name: 'FilterInputComponent',
  props: {
    prop: {
      type: String as PropType<FilterInputComponentProps['prop']>,
    },
    options: {
      type: Object as PropType<FilterInputComponentProps['options']>,
    },
    value: {
      type: (null as any) as PropType<FilterInputComponentProps['value']>,
    },
  },
  setup: (props, ctx) => {
    const defaultKey = Object.keys(props.options).pop();

    const filter = ref('');

    const operator = ref(defaultKey || '');

    const input = ref(null);

    const constraint = computed(() => {
      return {
        name: props.prop,
        operator: operator.value,
        value: filter.value,
      };
    });

    const canSubmitForm = computed(() => !!props.prop);

    const handleApplyFilter = (): void => {
      ctx.emit('input', constraint.value);

      ctx.emit('filter-change');
    };

    const handleResetFilter = (): void => {
      filter.value = '';
      operator.value = defaultKey;

      this.$emit('input', null);
    };

    watchEffect(() => {
      if (props.value !== null) {
        filter.value = props.value.value;
        operator.value = props.value.operator;
      }
    });

    onMounted(() => {
      setImmediate(() => {
        input.value.focus();
      });
    });

    return () => {
      return (
        <div ref="filterInput" class="dockite-filter-input">
          <el-row type="flex" justify="space-between" align="middle">
            <span class="text-xs">Apply a Filter</span>

            <el-tooltip placement="top">
              {{
                default: () => <i class="el-icon-question" style="padding-right: 0.25rem;"></i>,
                content: () =>
                  Object.entries(props.options).map(([option, description]) => (
                    <div>
                      <strong>{option}</strong>
                      {description}
                    </div>
                  )),
              }}
            </el-tooltip>
          </el-row>

          <el-input
            ref={input}
            v-model={filter.value}
            size="small"
            placeholder="Value"
            class="input-with-select"
            style="padding-top: 10px"
            onKeyup={handleApplyFilter}
          >
            {{
              append: () => (
                <el-select
                  v-model={operator.value}
                  filterable
                  default-first-option
                  placeholder="Select"
                >
                  {Object.keys(props.options).map(option => (
                    <el-option value={option} label={option} />
                  ))}
                </el-select>
              ),
            }}
          </el-input>

          <el-row
            type="flex"
            justify="space-between"
            align="middle"
            style="width: 100%; padding-top: 7px;"
          >
            <el-button type="text" size="mini" onClick={handleResetFilter}>
              Reset
            </el-button>

            <el-button
              type="primary"
              size="mini"
              disabled={!canSubmitForm.value}
              onClick={handleApplyFilter}
            >
              Apply Filter
            </el-button>
          </el-row>
        </div>
      );
    };
  },
});
