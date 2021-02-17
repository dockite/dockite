import { BaseField } from '@dockite/database';
import { DockiteFieldInputComponentProps } from '@dockite/types';
import { computed, defineComponent, inject, PropType, ref, toRefs, toRef, Ref } from 'vue';

import { DockiteFieldVariantEntity } from '../types';

import { getForm, getVariantField } from './util';

export type InputComponentProps = DockiteFieldInputComponentProps<
  Record<string, any> | null,
  DockiteFieldVariantEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldVariantInput',

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

    groups: {
      type: Object as PropType<InputComponentProps['groups']>,
      required: true,
    },

    schema: {
      type: Object as PropType<InputComponentProps['schema']>,
      required: true,
    },

    errors: {
      type: Object as PropType<InputComponentProps['errors']>,
      required: true,
    },

    bulkEditMode: {
      type: Boolean as PropType<InputComponentProps['bulkEditMode']>,
      default: false,
    },
  },

  setup: (props, ctx) => {
    const { errors, fieldConfig, name } = toRefs(props);

    const modelValue = toRef(props, 'modelValue') as Ref<InputComponentProps['value']>;

    const $message = inject<any>('$message');

    const rules = ref<Array<Record<string, any>>>([]);

    const fieldData = computed({
      get: () => modelValue.value,
      set: newValue => ctx.emit('update:modelValue', newValue),
    });

    const settings = computed(() => fieldConfig.value.settings);

    const variants = computed<BaseField[]>(() =>
      settings.value.children.map(child => {
        return {
          ...fieldConfig.value,
          ...child,
        };
      }),
    );

    const selectedVariant = computed<BaseField | null>(() => {
      if (!fieldData.value || Object.keys(fieldData.value).length === 0) {
        return null;
      }

      const [fieldName] = Object.keys(fieldData.value);

      return getVariantField(fieldName, variants.value);
    });

    const handleSelectVariant = (name: string): void => {
      const field = getVariantField(name, variants.value);

      if (!field) {
        $message.error(`No variant for "${name}" exists`);
      } else {
        fieldData.value = {
          [name]: field.settings.default ?? null,
        };
      }
    };

    const handleClearVariant = (): void => {
      fieldData.value = null;
    };

    const getVariantView = (): JSX.Element | JSX.Element[] => {
      if (!selectedVariant.value || !fieldData.value) {
        return (
          <div class="p-3">
            <el-alert title="Select a Variant from the below options." type="info" />

            <div class="flex flex-wrap items-center py-3 -mx-3">
              {variants.value.map(variant => (
                <div class="px-3 w-1/3">
                  <div
                    class="w-full h-full border rounded hover:bg-gray-200 text-center p-3 transition"
                    role="button"
                    onClick={() => handleSelectVariant(variant.name)}
                  >
                    <div class="block font-semibold">{variant.title}</div>

                    <div class="text-sm pb-2">{variant.description}</div>

                    <el-tag size="mini">{variant.type}</el-tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div class="p-3">
          {getForm(fieldData.value, [selectedVariant.value], props)}

          <div class="pt-3 flex items-center justify-between">
            <span />

            <el-button type="text" size="mini" onClick={() => handleClearVariant()}>
              Clear selected Variant
            </el-button>
          </div>
        </div>
      );
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    return () => (
      <el-form-item
        class={`dockite-field-variant ${errors.value[name.value] ? 'is-error' : ''}`}
        label={fieldConfig.value.title}
        prop={name.value}
        rules={rules.value}
      >
        <el-collapse class="border">
          <el-collapse-item>
            {{
              title: () => {
                if (selectedVariant.value) {
                  return (
                    <span class="px-3">
                      {fieldConfig.value.title} {'>'} {selectedVariant.value.title}
                    </span>
                  );
                }

                return <span class="px-3">{fieldConfig.value.title}</span>;
              },

              default: () => getVariantView(),
            }}
          </el-collapse-item>
        </el-collapse>

        {errors.value[name.value] && (
          <div class="el-form-item__error">{errors.value[name.value]}</div>
        )}

        <div class="el-form-item__description">{fieldConfig.value.description}</div>
      </el-form-item>
    );
  },
});

export default InputComponent;
