import { Field, Schema } from '@dockite/database';
import { sortBy } from 'lodash';

import { ApplicationError, ApplicationErrorCode } from '~/common/errors';
import { useDockite } from '~/dockite';

export const getFieldsByGroup = (groupName: string, schema: Schema): Field[] => {
  const groups = schema.groups as Record<string, string[]>;

  return sortBy(
    schema.fields.filter(field => groups[groupName].includes(field.name)),
    field => groups[groupName].indexOf(field.name),
  );
};

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

  const FieldComponent = fieldManager[field.type].input;

  console.log({ FieldComponent });

  if (FieldComponent === null) {
    return null;
  }

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
