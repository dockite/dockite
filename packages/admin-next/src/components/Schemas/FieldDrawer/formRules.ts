import { BaseField } from '@dockite/database';

import { BaseSchema } from '~/common/types';

export const fieldSettingsFormRules = {
  title: [
    {
      required: true,
      message: 'Title is required.',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 26,
      message: 'Title must be at least 3 characters and no more than 26 characters.',
      trigger: 'blur',
    },
  ],
  name: [
    {
      required: true,
      message: 'Identifier is required',
      trigger: 'blur',
    },
    {
      pattern: /^[_A-Za-z][_0-9A-Za-z]*$/,
      message:
        'Identifier must be a valid API identifier containing only: letters, numbers and underscores.',
      trigger: 'blur',
    },
    {
      min: 3,
      max: 26,
      message: 'Identifier must be at least 3 characters and no more than 26 characters.',
      trigger: 'blur',
    },
  ],
};

export const getIdentifierUniqueFormRule = (
  schema: BaseSchema,
  field?: BaseField,
): Record<string, any> => {
  return {
    message: 'Identifier must not already be used with a different field.',
    trigger: 'blur',
    validator: async (_rule: never, value: string): Promise<void> => {
      const identifierUsed = schema.fields.some(f => {
        if (field && f.id) {
          return f.name === value && f.id !== field.id;
        }

        return f.name === value;
      });

      if (identifierUsed) {
        throw new Error('Identifier has already been used');
      }
    },
  };
};

export default fieldSettingsFormRules;
