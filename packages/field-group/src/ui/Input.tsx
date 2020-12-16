import { computed, defineComponent, PropType, ref, toRefs, toRef, Ref } from 'vue';
import { DockiteFieldInputComponentProps } from '@dockite/types';
import cloneDeep from 'lodash/cloneDeep';
import VueDraggable from 'vuedraggable';

import { DockiteFieldGroupEntity, ChildField } from '../types';

import { getInitialFieldData, MaybeArray, getForm } from './util';

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

    const modelValue = toRef(props, 'modelValue') as Ref<MaybeArray<Record<string, any>>>;

    const rules = ref<Array<Record<string, any>>>([]);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    const fields = computed<ChildField[]>(() => fieldConfig.value.settings.children);

    // Handles the expansion of the group field.
    const expanded = ref('');

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
        fieldData.value = new Array(fieldConfig.value.settings.minRows ?? 0)
          .fill(0)
          .map(_ => cloneDeep(initialFieldData));
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
          min: Number(fieldConfig.value.settings.minRows),
          message: `${fieldConfig.value.title} must contain atleast ${fieldConfig.value.settings.minRows} entries.`,
          trigger: 'blur',
        });
      }

      if (fieldConfig.value.settings.maxRows) {
        rules.value.push({
          max: Number(fieldConfig.value.settings.maxRows),
          message: `${fieldConfig.value.title} must contain no more than ${fieldConfig.value.settings.maxRows} entries.`,
          trigger: 'blur',
        });
      }
    }

    return (): JSX.Element => {
      return (
        <el-form-item prop={name} rules={rules} class="dockite-field-group">
          <el-collapse value={expanded} class="border">
            <el-collapse-item name={name}>
              {{
                title: () => (
                  <div class="w-full px-3">
                    <span class="font-semibold">Group: {fieldConfig.value.title}</span>
                  </div>
                ),
                default: () => {
                  if (fieldConfig.value.settings.repeatable && Array.isArray(fieldData.value)) {
                    return (
                      <>
                        <el-button circle size="small" onClick={handleAddFieldBefore}>
                          <i class="el-icon-plus" />
                        </el-button>

                        <VueDraggable
                          v-model={fieldData.value}
                          animation={300}
                          easing="cubic-bezier(0.37, 0, 0.63, 1)"
                          style={{ minHeight: '30px' }}
                          handle=".dockite-field-group__item-handle"
                        >
                          {{
                            item: (_: never, index: number) => (
                              <div class="flex-1 clearfix">
                                <i class="dockite-field-group__item-handle">HANDLE</i>
                                {getForm(fieldData.value, fields.value, props, index)}
                              </div>
                            ),
                          }}
                        </VueDraggable>

                        <el-button circle size="small" onClick={handleAddFieldAfter}>
                          <i class="el-icon-plus" />
                        </el-button>
                      </>
                    );
                  }

                  return (
                    <div class="dockite-field-group--item items-center mb-3">
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
