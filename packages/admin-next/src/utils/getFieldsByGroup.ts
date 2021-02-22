import { BaseField, Schema } from '@dockite/database';
import { sortBy } from 'lodash';

import { BaseSchema } from '~/common/types';

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
