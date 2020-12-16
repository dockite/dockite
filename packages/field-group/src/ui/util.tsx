import { getCurrentInstance, DefineComponent } from 'vue';
import { DockiteFieldInputComponentProps } from '@dockite/types';

import { ChildField } from '../types';

export type MaybeArray<T> = T | Array<T>;

export type Nullable<T> = T | null;

export const getInitialFieldData = (fields: ChildField[]): Record<string, null> => {
  return fields.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.name]: curr.settings.default ?? null,
    };
  }, {});
};

export const getForm = (
  fieldData: MaybeArray<Record<string, any>>,
  fields: ChildField[],
  props: Omit<DockiteFieldInputComponentProps<never, any>, 'modelValue'>,
  index?: number,
): Nullable<JSX.Element>[] => {
  const instance = getCurrentInstance();

  if (!instance) {
    return [null];
  }

  const { $dockite } = instance.appContext.config.globalProperties;

  if (!$dockite) {
    return [null];
  }

  return fields.map(field => {
    if (!$dockite.fieldManager[field.type]) {
      return (
        <div class="p-3 rounded bg-red-400 border-red-600 text-center">
          The field of type "{field.type}" does not exist, unable to display "{field.title}".
        </div>
      );
    }

    const InputComponent = $dockite.fieldManager[field.type].input as Nullable<
      DefineComponent<DockiteFieldInputComponentProps<any, any>>
    >;

    if (!InputComponent) {
      return null;
    }

    if (index !== undefined) {
      if (Array.isArray(fieldData)) {
        return (
          <InputComponent
            name={`${props.name}.${index}.${field.name}`}
            bulkEditMode={props.bulkEditMode}
            errors={props.errors}
            v-model={fieldData[index][field.name]}
            fieldConfig={field}
            formData={props.formData}
            schema={props.schema}
          />
        );
      }

      return [<div>Provided fieldData was not of type Array</div>];
    }

    if (Array.isArray(fieldData)) {
      return [<div>Index not provided for fieldData of type Array</div>];
    }

    return (
      <InputComponent
        name={`${props.name}.${field.name}`}
        bulkEditMode={props.bulkEditMode}
        errors={props.errors}
        v-model={fieldData[field.name]}
        fieldConfig={field}
        formData={props.formData}
        schema={props.schema}
      />
    );
  });
};
