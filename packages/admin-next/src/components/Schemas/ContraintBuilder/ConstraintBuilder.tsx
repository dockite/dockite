import { computed, defineComponent, PropType } from 'vue';

import {
  AndQuery,
  OrQuery,
  Constraint,
  ConstraintArray,
  ConstraintOperator,
  PossibleConstraints,
  SupportedOperators,
} from '@dockite/where-builder/lib/types';

import { SchemaConstraintBuilderComponentProps } from './types';
import { isAndQuery, isConstraintItem, isOrQuery } from './util';

const DEPTH_CLASSES = [
  'border-blue-400',
  'border-orange-400',
  'border-green-400',
  'border-yellow-400',
  'border-teal-400',
  'border-pink-400',
  'border-indigo-400',
  'border-purple-400',
  'border-red-400',
];

export const SchemaConstraintBuilderComponent = defineComponent({
  name: 'SchemaConstraintBuilderComponent',

  props: {
    modelValue: {
      type: (null as any) as PropType<SchemaConstraintBuilderComponentProps['modelValue']>,
    },

    schema: {
      type: Object as PropType<SchemaConstraintBuilderComponentProps['schema']>,
      required: true,
    },

    depth: {
      type: Number as PropType<SchemaConstraintBuilderComponentProps['depth']>,
      default: 1,
    },
  },

  emits: ['update:modelValue'],

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as SchemaConstraintBuilderComponentProps['modelValue'],
      set: value => ctx.emit('update:modelValue', value),
    });

    const modelValueConstraintArray = computed({
      get: () => {
        if (modelValue.value && 'AND' in modelValue.value) {
          return modelValue.value.AND;
        }

        if (modelValue.value && 'OR' in modelValue.value) {
          return modelValue.value.OR;
        }

        return null;
      },

      set: value => {
        if (!value || !modelValue.value) {
          return;
        }

        if (modelValue.value && 'AND' in modelValue.value) {
          modelValue.value.AND = value;
        }

        if (modelValue.value && 'OR' in modelValue.value) {
          modelValue.value.OR = value;
        }
      },
    });

    const constraintType = computed(() => {
      if (modelValue.value) {
        return Object.keys(modelValue.value).pop() as 'AND' | 'OR';
      }

      return null;
    });

    const borderClass = computed(() => DEPTH_CLASSES[props.depth % DEPTH_CLASSES.length]);

    const handleAddAndConstraint = (): void => {
      if (!modelValue.value) {
        modelValue.value = {
          AND: [],
        };
      }

      if (modelValueConstraintArray.value) {
        modelValueConstraintArray.value.push({
          AND: [],
        });
      }
    };

    const handleAddOrConstraint = (): void => {
      if (!modelValue.value) {
        modelValue.value = {
          OR: [],
        };
      }

      if (modelValueConstraintArray.value) {
        modelValueConstraintArray.value.push({
          OR: [],
        });
      }
    };

    const handleAddConstraintItem = (index?: number): void => {
      if (modelValueConstraintArray.value) {
        if (index === undefined) {
          modelValueConstraintArray.value.push({
            name: '',
            operator: '$ilike',
            value: '',
          });
        }

        if (index !== undefined) {
          modelValueConstraintArray.value.splice(index, 0, {
            name: '',
            operator: '$ilike',
            value: '',
          });
        }
      }
    };

    const getConstraintItemView = (
      _constraint: PossibleConstraints,
      index: number,
    ): JSX.Element => {
      if (
        modelValueConstraintArray.value &&
        modelValueConstraintArray.value[index] &&
        (isOrQuery(modelValueConstraintArray.value[index]) ||
          isAndQuery(modelValueConstraintArray.value[index]))
      ) {
        if (modelValueConstraintArray.value) {
          return (
            <div class="pb-2 flex flex-col">
              <div class={{ hidden: modelValueConstraintArray.value.length > 1 }}>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-plus"
                  title="Add Constraint Item"
                  onClick={() => handleAddConstraintItem(index)}
                />
              </div>

              <SchemaConstraintBuilderComponent
                v-model={modelValueConstraintArray.value[index]}
                schema={props.schema}
                depth={props.depth + 1}
              />
            </div>
          );
        }
      }

      if (
        modelValueConstraintArray.value &&
        modelValueConstraintArray.value[index] &&
        isConstraintItem(modelValueConstraintArray.value[index])
      ) {
        return (
          <div class="flex items-center -mx-2 pb-3">
            <div class="px-2">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-plus"
                title="Add Constraint above Current Item"
                onClick={() => handleAddConstraintItem(index)}
              />
            </div>

            <div class="flex items-center -mx-2 px-2">
              <div class="px-2" style={{ width: '40%' }}>
                <el-input
                  v-model={(modelValueConstraintArray.value[index] as Constraint).name}
                  placeholder="Name"
                />
              </div>

              <div class="px-2" style={{ width: '20%' }}>
                <el-select
                  v-model={(modelValueConstraintArray.value[index] as Constraint).operator}
                  placeholder="Operator"
                >
                  {SupportedOperators.map(operator => (
                    <el-option value={operator} label={operator} />
                  ))}
                </el-select>
              </div>

              <div class="px-2" style={{ width: '40%' }}>
                <el-input
                  v-model={(modelValueConstraintArray.value[index] as Constraint).value}
                  placeholder="Value"
                />
              </div>
            </div>
          </div>
        );
      }

      return <div></div>;
    };

    return () => {
      return (
        <div
          class={{
            'p-3 relative border-l-4': true,
            [borderClass.value]: true,
            'mt-3': props.depth > 1,
          }}
        >
          {constraintType.value && (
            <div class="absolute left-0 font-semibold transform -rotate-90">
              {constraintType.value}
            </div>
          )}

          <div class="pl-3">
            {modelValueConstraintArray.value && (
              <div>
                <div class={{ 'pb-3': true, hidden: modelValueConstraintArray.value.length > 0 }}>
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-plus"
                    title="Add Constraint Item"
                    onClick={() => handleAddConstraintItem()}
                  />
                </div>

                {modelValueConstraintArray.value.map((constraint, index) =>
                  getConstraintItemView(constraint, index),
                )}
              </div>
            )}

            {props.depth < 5 && (
              <div class="pt-3">
                <el-button onClick={() => handleAddAndConstraint()}>AND</el-button>

                <el-button onClick={() => handleAddOrConstraint()}>OR</el-button>
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});

export default SchemaConstraintBuilderComponent;
