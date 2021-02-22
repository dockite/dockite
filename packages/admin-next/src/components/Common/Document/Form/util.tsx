import { Field, Schema } from '@dockite/database';
import { toRaw } from 'vue';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { useDockite } from '~/dockite';

export const getFieldComponent = (
  field: Field,
  schema: Schema,
  formData: Record<string, any>,
  groups: Record<string, string[]>,
  errors: Record<string, string>,
): JSX.Element | null => {
  if (field.settings.hidden) {
    return null;
  }

  const { fieldManager } = useDockite();

  if (!fieldManager[field.type]) {
    throw new ApplicationError(
      `No handler for field of type "${field.type}" exists`,
      ApplicationErrorCode.NO_FIELD_HANDLER,
    );
  }

  let FieldComponent = fieldManager[field.type].input;

  if (FieldComponent === null) {
    return null;
  }

  FieldComponent = toRaw(FieldComponent);

  return (
    <FieldComponent
      fieldConfig={field}
      formData={formData}
      name={field.name}
      schema={schema}
      errors={errors}
      v-models={[
        [formData[field.name], 'modelValue'],
        [groups, 'groups'],
      ]}
    />
  );
};

export default getFieldComponent;
