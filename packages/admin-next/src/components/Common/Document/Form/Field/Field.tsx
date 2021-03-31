import { computed, defineComponent, PropType, toRaw, toRefs } from 'vue';

import { Field, Schema } from '@dockite/database';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { useDockite } from '~/dockite';

export interface FormFieldComponentProps {
  field: Field;
  schema: Schema;
  formData: Record<string, any>;
  groups: Record<string, string[]>;
  errors: Record<string, string>;
}

export const FormFieldComponent = defineComponent({
  name: 'FormFieldComponent',

  props: {
    field: {
      type: Object as PropType<FormFieldComponentProps['field']>,
      required: true,
    },

    schema: {
      type: Object as PropType<FormFieldComponentProps['schema']>,
      required: true,
    },

    formData: {
      type: Object as PropType<FormFieldComponentProps['formData']>,
      required: true,
    },

    groups: {
      type: Object as PropType<FormFieldComponentProps['groups']>,
      required: true,
    },

    errors: {
      type: Object as PropType<FormFieldComponentProps['errors']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const { field, formData, schema, groups, errors } = toRefs(props);

    const { fieldManager } = useDockite();

    const modelValue = computed({
      get: () => formData.value[field.value.name] ?? null,
      set: value => {
        formData.value[field.value.name] = value;
      },
    });

    const groupsModel = computed({
      get: () => groups.value,
      set: value => {
        groups.value = value;
      },
    });

    return () => {
      if (!fieldManager[field.value.type]) {
        throw new ApplicationError(
          `No handler for field of type "${field.value.type}" exists`,
          ApplicationErrorCode.NO_FIELD_HANDLER,
        );
      }

      let FieldComponent = fieldManager[field.value.type].input;

      if (FieldComponent === null) {
        return null;
      }

      FieldComponent = toRaw(FieldComponent);

      return (
        <FieldComponent
          class={`dockite-form-${field.value.name}`}
          fieldConfig={field.value}
          formData={formData.value}
          name={field.value.name}
          schema={schema.value}
          errors={errors.value}
          v-models={[
            [modelValue.value, 'modelValue'],
            [groupsModel.value, 'groups'],
          ]}
        />
      );
    };
  },
});

export default FormFieldComponent;
