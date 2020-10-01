import { BaseField } from '@dockite/database';
import { sortBy, cloneDeep } from 'lodash';

// That is horrifying
export const stableJSONStringify = (obj: any, space = 2): string => {
  const clone = cloneDeep(obj);

  if (clone.fields) {
    clone.fields = sortFields(clone.fields);
  }

  const keys: string[] = [];

  JSON.stringify(clone, (key, value) => {
    keys.push(key);
    return value;
  });

  keys.sort();

  return JSON.stringify(clone, keys, space);
};

const recursiveReplacer = (key: string, value: any, keyCollection: string[]): any => {
  if (!keyCollection.includes(key)) {
    keyCollection.push(key);
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
    }

    JSON.stringify(value, (key, value) => recursiveReplacer(key, value, keyCollection));
  }

  return value;
};

export const recursiveStableJSONStringify = (obj: any, space = 2): string => {
  const clone = cloneDeep(obj);

  const keyCollection: string[] = [];

  if (clone.fields) {
    clone.fields = sortFields(clone.fields);
  }

  JSON.stringify(clone, (key, value) => recursiveReplacer(key, value, keyCollection));

  keyCollection.sort();

  return JSON.stringify(clone, keyCollection, space);
};

export const sortFields = (fields: BaseField[]): BaseField[] => {
  fields.forEach(field => {
    if (field.settings.children && Array.isArray(field.settings.children)) {
      field.settings.children = sortFields(field.settings.children);
    }
  });

  return sortBy(fields, 'name');
};
