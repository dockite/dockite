import { DockiteFieldInputComponentProps } from '@dockite/types';
import cloneDeep from 'lodash/cloneDeep';
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
  Ref,
  toRef,
  toRefs,
  watch,
} from 'vue';
import VueDraggable from 'vuedraggable';

import { ChildField, DockiteFieldGroupEntity } from '../types';

import { getForm, getInitialFieldData, MaybeArray } from './util';

import './Input.scss';

export type InputComponentProps = DockiteFieldInputComponentProps<
  MaybeArray<Record<string, any>>,
  DockiteFieldGroupEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldGroupInput',

  props: {
    name: {
      type: String as PropType<InputComponentProps['name']>,
      required: true,
    },

    modelValue: {
      type: (null as any) as PropType<InputComponentProps['value']>,
      required: true,
    },

    formData: {
      type: Object as PropType<InputComponentProps['formData']>,
      required: true,
    },

    fieldConfig: {
      type: Object as PropType<InputComponentProps['fieldConfig']>,
      required: true,
    },

    errors: {
      type: Object as PropType<InputComponentProps['errors']>,
      required: true,
    },

    groups: {
      type: Object as PropType<InputComponentProps['groups']>,
      required: true,
    },

    schema: {
      type: Object as PropType<InputComponentProps['schema']>,
      required: true,
    },

    bulkEditMode: {
      type: Boolean as PropType<InputComponentProps['bulkEditMode']>,
      default: false,
    },
  },

  setup: (props, ctx) => {
    const { fieldConfig, name } = toRefs(props);

    const modelValue = toRef(props, 'modelValue') as Ref<InputComponentProps['value']>;

    const rules = ref<Array<Record<string, any>>>([]);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    const settings = computed(() => fieldConfig.value.settings);

    const fields = computed<ChildField[]>(() => fieldConfig.value.settings.children);

    // Handles the expansion of the group field.
    const expanded = ref('');

    const ready = ref(false);

    // The initial field data for the group or group item
    const initialFieldData = getInitialFieldData(fields.value);

    // If it's not a nested group or the value hasn't been set then we can
    // automatically expand it
    if (name.value === fieldConfig.value.name || fieldData.value === null) {
      expanded.value = name.value;
    }

    // If the value hasn't been set then we should initialise it to a reasonable
    // set of defaults
    if (fieldData.value === null) {
      if (fieldConfig.value.settings.repeatable) {
        if (fieldConfig.value.settings.minRows && fieldConfig.value.settings.minRows > 0) {
          fieldData.value = new Array(fieldConfig.value.settings.minRows)
            .fill(0)
            .map(_ => cloneDeep(initialFieldData));
        } else {
          fieldData.value = [];
        }
      } else {
        fieldData.value = cloneDeep(initialFieldData);
      }
    }

    // Merge the current value of the group item/s with the provided defaults to
    // handle post creation updates to children.
    if (fieldConfig.value.settings.repeatable) {
      // If the item is already an array we will map and merge each item
      if (Array.isArray(fieldData.value)) {
        fieldData.value = fieldData.value.map(item => {
          return {
            ...cloneDeep(initialFieldData),
            ...item,
          };
        });
      } else {
        // Otherwise if the item is meant to be an array but we only have a root item
        // we will turn it into an array and map and merge
        fieldData.value = [{ ...cloneDeep(initialFieldData), ...fieldData.value }];
      }
    } else {
      // Otherwise we just perform a map and merge
      fieldData.value = { ...cloneDeep(initialFieldData), ...fieldData.value };
    }

    onMounted(() => {
      ready.value = true;
    });

    watch(
      fieldData,
      () => {
        if (Array.isArray(fieldData.value)) {
          fieldData.value.forEach(item => {
            // eslint-disable-next-line
            if (!item.__sortable_item_key && fieldData.value) {
              // eslint-disable-next-line
              item.__sortable_item_key = Math.random()
                .toString(36)
                .slice(2);
            }
          });
        }
      },
      { immediate: true },
    );

    const handleAddFieldBefore = (): void => {
      if (Array.isArray(fieldData.value)) {
        fieldData.value = [{ ...cloneDeep(initialFieldData) }, ...fieldData.value];
      }
    };

    const handleAddFieldAfter = (): void => {
      if (Array.isArray(fieldData.value)) {
        fieldData.value = [...fieldData.value, { ...cloneDeep(initialFieldData) }];
      }
    };

    const handleRemoveField = (index: number): void => {
      if (Array.isArray(fieldData.value)) {
        fieldData.value.splice(index, 1);
      }
    };

    const handleShiftFieldUp = (index: number): void => {
      if (Array.isArray(fieldData.value)) {
        if (index === 0) {
          return;
        }

        const [fieldItem] = fieldData.value.splice(index, 1);

        fieldData.value.splice(index - 1, 0, fieldItem);
      }
    };

    const handleShiftFieldDown = (index: number): void => {
      if (Array.isArray(fieldData.value)) {
        const [fieldItem] = fieldData.value.splice(index, 1);

        fieldData.value.splice(index + 1, 0, fieldItem);
      }
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    if (fieldConfig.value.settings.repeatable) {
      if (fieldConfig.value.settings.minRows) {
        rules.value.push({
          type: 'array',
          min: Number(fieldConfig.value.settings.minRows),
          message: `${fieldConfig.value.title} must contain atleast ${fieldConfig.value.settings.minRows} entries.`,
          trigger: 'blur',
        });
      }

      if (fieldConfig.value.settings.maxRows) {
        rules.value.push({
          type: 'array',
          max: Number(fieldConfig.value.settings.maxRows),
          message: `${fieldConfig.value.title} must contain no more than ${fieldConfig.value.settings.maxRows} entries.`,
          trigger: 'blur',
        });
      }
    }

    return (): JSX.Element => {
      return (
        <el-form-item prop={name.value} rules={rules.value} class="dockite-field-group">
          <el-collapse value={expanded.value} class="border">
            <el-collapse-item name={name.value}>
              {{
                title: () => (
                  <div class="w-full px-3">
                    <span class="font-semibold">{fieldConfig.value.title}</span>
                  </div>
                ),
                default: () => {
                  if (!fieldData.value) {
                    return (
                      <el-alert title="No field data found" type="error" show-icon>
                        There is currently no field data for "{fieldConfig.value.title}", if this
                        error persists please file an issue.
                      </el-alert>
                    );
                  }

                  if (fieldConfig.value.settings.repeatable && Array.isArray(fieldData.value)) {
                    return (
                      <div class="pt-3 px-3">
                        <div
                          class={{
                            hidden: fieldData.value.length === 0,
                            'text-center': true,
                            'py-3': true,
                          }}
                        >
                          <el-button circle size="small" onClick={handleAddFieldBefore}>
                            <i class="el-icon-plus" />
                          </el-button>
                        </div>

                        {fieldData.value.length > 0 && ready.value && (
                          <div class="-my-3">
                            <VueDraggable
                              v-model={fieldData.value}
                              itemKey="__sortable_item_key"
                              animation={300}
                              easing="cubic-bezier(0.37, 0, 0.63, 1)"
                              style={{ minHeight: '30px' }}
                              handle=".dockite-field-group__item-handle"
                            >
                              {{
                                item: ({ index }: { index: number }) => (
                                  <div class="py-3 flex items-center">
                                    <div class="pr-3 flex flex-col items-center justify-center text-center dockite-field-group--movement-buttons">
                                      <el-button
                                        class="dockite-field-group--movement-button"
                                        type="text"
                                        icon="el-icon-top"
                                        // length = 2, index = 1
                                        disabled={index === 0}
                                        onClick={() => handleShiftFieldUp(index)}
                                      />

                                      {/* Draggable Handle */}
                                      <i class="dockite-field-group__item-handle dockite-field-group--movement-button py-1 cursor-pointer el-icon-rank" />

                                      <el-button
                                        class="dockite-field-group--movement-button"
                                        type="text"
                                        icon="el-icon-bottom"
                                        disabled={index === fieldData.value!.length - 1}
                                        onClick={() => handleShiftFieldDown(index)}
                                      />

                                      <el-button
                                        class="dockite-field-group--movement-button"
                                        type="text"
                                        icon="el-icon-delete"
                                        disabled={
                                          fieldData.value!.length <=
                                            (settings.value.minRows ?? 0) ||
                                          fieldData.value!.length >=
                                            (settings.value.maxRows ?? Infinity)
                                        }
                                        style={{ color: '#F56C6C' }}
                                        onClick={() => handleRemoveField(index)}
                                      />
                                    </div>

                                    <div class="flex-1 clearfix border border-dashed p-3">
                                      {getForm(
                                        fieldData.value as Record<string, any>[],
                                        fields.value,
                                        props,
                                        index,
                                      )}
                                    </div>
                                  </div>
                                ),
                              }}
                            </VueDraggable>
                          </div>
                        )}

                        <div class="text-center py-3">
                          <el-button circle size="small" onClick={handleAddFieldAfter}>
                            <i class="el-icon-plus" />
                          </el-button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div class="dockite-field-group--item items-center mb-3 pt-3 px-3">
                      <div class="flex-1">{getForm(fieldData.value, fields.value, props)}</div>
                    </div>
                  );
                },
              }}
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      );
    };
  },
});

export default InputComponent;
