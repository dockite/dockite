import { sortBy } from 'lodash';

import { BaseField } from '@dockite/database';

import { BaseSchema } from '~/common/types';

/**
 *
 */
export const getFieldsByGroup = (groupName: string, schema: BaseSchema): BaseField[] => {
  const groups = schema.groups as Record<string, string[]>;

  if (!groups[groupName]) {
    return [];
  }

  return sortBy(
    schema.fields.filter(field => groups[groupName].includes(field.name)),
    field => groups[groupName].indexOf(field.name),
  );
};

export default getFieldsByGroup;
