import { Field } from '@dockite/types';

export const strToColumnPath = (str: string, splitChar = '.'): string => {
  return str
    .split(splitChar)
    .map((chunk, i) => {
      if (i === 0) {
        return chunk;
      }

      return `'${chunk}'`;
    })
    .join(' ->');
};

export const makeInitialFieldDataForDocument = (fields: Field[]): Record<string, any> => {
  return fields.reduce((acc, curr) => {
    return {
      ...acc,
      [curr.name]:
        curr.settings.default !== undefined
          ? curr.settings.default
          : curr.dockiteField?.defaultValue(),
    };
  }, {});
};
