import { Schema, Singleton } from '@dockite/database';

import { BaseDocument } from '~/common/types';

/**
 *
 */
export const getInitialFormData = (
  document: BaseDocument | Singleton,
  schema: Schema | Singleton,
): Record<string, any> => {
  const data: Record<string, any> = {};

  schema.fields.forEach(field => {
    if (document.data[field.name] === undefined) {
      data[field.name] = field.settings.default ?? null;
    } else {
      data[field.name] = document.data[field.name];
    }
  });

  return data;
};

export default getInitialFormData;
