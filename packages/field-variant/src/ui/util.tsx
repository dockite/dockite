import { BaseField } from '@dockite/database';
import { DockiteFieldInputComponentProps } from '@dockite/types';
import { DefineComponent, getCurrentInstance, toRaw } from 'vue';

export type Nullable<T> = T | null;

export const getInitialFieldData = (fields: BaseField[]): Record<string, null> => {
  return fields.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.name]: curr.settings.default ?? null,
    };
  }, {});
};

export const getForm = (
  fieldData: Record<string, any>,
  fields: BaseField[],
  props: Omit<DockiteFieldInputComponentProps<never, any>, 'modelValue'>,
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

    let InputComponent = $dockite.fieldManager[field.type].input as Nullable<
      DefineComponent<DockiteFieldInputComponentProps<any, any>>
    >;

    if (!InputComponent) {
      return null;
    }

    InputComponent = toRaw(InputComponent);

    return (
      <InputComponent
        v-model={fieldData[field.name]}
        name={`${props.name}.${field.name}`}
        bulkEditMode={props.bulkEditMode}
        errors={props.errors}
        groups={props.groups}
        fieldConfig={field}
        formData={props.formData}
        schema={props.schema}
      />
    );
  });
};

export const getVariantField = (name: string, variants: BaseField[]): BaseField | null => {
  const child = variants.find(child => child.name === name);

  if (!child) {
    return null;
  }

  return child;
};
