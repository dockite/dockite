import { DockiteFieldInputComponentProps } from '@dockite/types';
import { pick } from 'lodash';
import slugify from 'slugify';
import { computed, defineComponent, PropType, ref, toRefs, watchEffect } from 'vue';

import { REMOVE_REGEX } from '../constants';
import { DockiteFieldSlugEntity } from '../types';

export type InputComponentProps = DockiteFieldInputComponentProps<string, DockiteFieldSlugEntity>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldSlugInput',

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
  },

  setup: (props, ctx) => {
    const { errors, fieldConfig, modelValue, formData, name } = toRefs(props);

    const rules = ref<Array<Record<string, any>>>([]);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    const frozen = ref(false);

    const manuallyEditing = ref(false);

    const settings = computed(() => fieldConfig.value.settings);

    const formFields = computed<Record<string, any>>(() => {
      // eslint-disable-next-line prefer-destructuring
      const fieldsToSlugify = settings.value.fieldsToSlugify ?? [];

      if (fieldsToSlugify.length === 0) {
        return {};
      }

      return pick(formData.value, ...fieldsToSlugify);
    });

    if (fieldData.value) {
      frozen.value = true;
    }

    const handleFreeze = (): void => {
      frozen.value = true;
    };

    const handleUnfreeze = (): void => {
      frozen.value = false;
    };

    const handleBlur = (): void => {
      if (manuallyEditing.value && fieldData.value) {
        fieldData.value = slugify(fieldData.value, {
          lower: true,
          remove: REMOVE_REGEX,
          replacement: '-',
        });

        manuallyEditing.value = false;
      }

      handleFreeze();
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    watchEffect(() => {
      if (!fieldData.value) {
        frozen.value = false;
      }

      const slugifyValues = Object.values(formFields.value);

      if (
        !frozen.value &&
        !manuallyEditing.value &&
        slugifyValues.length > 0 &&
        slugifyValues.every(i => !!i)
      ) {
        fieldData.value = slugify(slugifyValues.map(v => String(v).trim()).join('-'), {
          lower: true,
          remove: REMOVE_REGEX,
          replacement: '-',
        });
      }
    });

    return () => (
      <el-form-item
        class={`dockite-field-slug ${errors.value[name.value] ? 'is-error' : ''}`}
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
      >
        <el-input
          v-model={fieldData.value}
          disabled={frozen.value}
          onFocus={() => {
            manuallyEditing.value = true;
          }}
          onBlur={handleBlur}
        />

        <div class="flex items-center justify-between">
          <span />

          <el-button type="text" size="mini" onClick={handleUnfreeze}>
            Edit Slug?
          </el-button>
        </div>

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}

        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
