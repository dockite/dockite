import { DockiteFieldInputComponentProps } from '@dockite/types';
import cloneDeep from 'lodash/cloneDeep';
import { computed, defineComponent, PropType, ref, toRefs, watch, onMounted } from 'vue';

import { DockiteFieldConditionalBooleanEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<
  boolean,
  DockiteFieldConditionalBooleanEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldConditionalBooleanInput',
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
    const { errors, fieldConfig, modelValue, name } = toRefs(props);

    const rules = ref<Array<Record<string, any>>>([]);

    const groupsBackup = ref<Record<string, string[]>>(cloneDeep(props.schema.groups));

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    const itemsToHide = computed(() => {
      return Object.keys(groupsBackup.value).reduce((acc, curr) => {
        if (fieldConfig.value.settings.groupsToHide.includes(curr)) {
          return acc;
        }

        return {
          ...acc,
          [curr]: groupsBackup.value[curr].filter(
            x => !fieldConfig.value.settings.fieldsToHide.includes(x),
          ),
        };
      }, {});
    });

    const itemsToShow = computed(() => {
      return Object.keys(groupsBackup.value).reduce((acc, curr) => {
        if (fieldConfig.value.settings.groupsToShow.includes(curr)) {
          return acc;
        }

        return {
          ...acc,
          [curr]: groupsBackup.value[curr].filter(
            x => !fieldConfig.value.settings.fieldsToShow.includes(x),
          ),
        };
      }, {});
    });

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    const handleFieldDataChange = (value: boolean): void => {
      if (!props.bulkEditMode) {
        if (value) {
          ctx.emit('update:groups', cloneDeep(groupsBackup.value));
          ctx.emit('update:groups', cloneDeep(itemsToHide.value));
        } else {
          ctx.emit('update:groups', cloneDeep(groupsBackup.value));
          ctx.emit('update:groups', cloneDeep(itemsToShow.value));
        }
      }
    };

    watch(fieldData, value => handleFieldDataChange(value || false));

    onMounted(() => {
      handleFieldDataChange(fieldData.value || false);
    });

    return (): JSX.Element => (
      <el-form-item
        class={`dockite-field-conditional-boolean ${errors.value[name.value] ? 'is-error' : ''}`}
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
      >
        <el-switch v-model={fieldData.value} size="large" />

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}
        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
