import { computed, defineComponent, PropType } from 'vue';

import {
  Constraint,
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

  emits: ['update:modelValue', 'action:removeConstraintGroup'],

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

    const handleAddAndConstraintGroup = (): void => {
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

    const handleAddOrConstraintGroup = (): void => {
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

    const handleRemoveConstraintGroup = (index?: number): void => {
      if (index !== undefined) {
        if (modelValueConstraintArray.value) {
          modelValueConstraintArray.value.splice(index, 1);
        }

        return;
      }

      if (props.depth === 1) {
        modelValue.value = null;

        return;
      }

      ctx.emit('action:removeConstraintGroup');
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

    const handleRemoveConstraintItem = (index: number): void => {
      if (modelValueConstraintArray.value && modelValueConstraintArray.value[index]) {
        modelValueConstraintArray.value.splice(index, 1);
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
                {...{ 'onAction:removeConstraintGroup': () => handleRemoveConstraintGroup(index) }}
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

            <div class="flex flex-1 items-center -mx-2 px-2">
              <div class="px-2 w-2/5">
                <el-select
                  v-model={(modelValueConstraintArray.value[index] as Constraint).name}
                  class="w-full"
                  placeholder="Name"
                >
                  <el-option label="Document Created Date" value="createdAt" />

                  <el-option label="Document Updated Date" value="createdAt" />

                  {props.schema.fields.map(field => (
                    <el-option label={field.title} value={field.name} />
                  ))}
                </el-select>
              </div>

              <div class="px-2 w-1/5">
                <el-select
                  v-model={(modelValueConstraintArray.value[index] as Constraint).operator}
                  placeholder="Operator"
                >
                  {SupportedOperators.map(operator => (
                    <el-option value={operator} label={operator} />
                  ))}
                </el-select>
              </div>

              <div class="px-2 w-2/5">
                {modelValueConstraintArray.value[index] &&
                (modelValueConstraintArray.value[index] as Constraint).operator.includes('date') ? (
                  <el-date-picker
                    type="datetime"
                    style={{ width: '100%' }}
                    v-model={(modelValueConstraintArray.value[index] as Constraint).value}
                    placeholder="Value"
                  />
                ) : (
                  <el-input
                    v-model={(modelValueConstraintArray.value[index] as Constraint).value}
                    disabled={(modelValueConstraintArray.value[
                      index
                    ] as Constraint).operator.includes('null')}
                    placeholder="Value"
                  />
                )}
              </div>
            </div>

            <div class="px-2">
              <el-button
                size="mini"
                type="text"
                class="hover:opacity-75"
                title="Remove Constraint"
                onClick={() => handleRemoveConstraintItem(index)}
              >
                <i class="el-icon-delete text-red-600 hover:text-red-600 hover:opacity-50" />
              </el-button>
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
            'mt-3 border-b-4': props.depth > 1,
          }}
        >
          {constraintType.value && (
            <div class="absolute left-0 font-semibold transform -rotate-90">
              {constraintType.value}
            </div>
          )}

          {/* Constraint item view */}
          <div class="pl-5">
            {/* Show help text when there are no currently applied constraints */}
            {!modelValue.value && (
              <p class="opacity-50">
                There are currently no applied constraints. You can add a constraint using the
                buttons below
              </p>
            )}

            {/* Add constraint item when there are none */}
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

            <div class="pt-3 flex items-center justify-between">
              {props.depth <= 5 && (
                <div>
                  <el-button onClick={() => handleAddAndConstraintGroup()}>AND</el-button>

                  <el-button onClick={() => handleAddOrConstraintGroup()}>OR</el-button>
                </div>
              )}

              {modelValue.value && (
                <el-button
                  size="mini"
                  type="text"
                  class="hover:opacity-75"
                  title="Remove Constraint"
                  onClick={() => handleRemoveConstraintGroup()}
                >
                  <span class="text-red-600 hover:text-red-600 hover:opacity-50">
                    Remove Constraint Group
                  </span>
                </el-button>
              )}
            </div>
          </div>
        </div>
      );
    };
  },
});

export default SchemaConstraintBuilderComponent;
