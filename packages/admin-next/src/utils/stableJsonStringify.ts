/* eslint-disable no-param-reassign */
import { cloneDeep, sortBy } from 'lodash';

import { BaseField } from '@dockite/database';

const recursiveReplacer = (key: string, value: any, keyCollection: string[]): any => {
  if (!keyCollection.includes(key)) {
    keyCollection.push(key);
  }

  if (typeof value === 'object') {
    JSON.stringify(value, (key, value) => recursiveReplacer(key, value, keyCollection));
  }

  return value;
};

/**
 *
 */
export const sortFields = (fields: BaseField[]): BaseField[] => {
  fields.forEach(field => {
    if (field.settings.children && Array.isArray(field.settings.children)) {
      field.settings.children = sortFields(field.settings.children);
    }
  });

  return sortBy(fields, 'name');
};

/**
 *
 */
export const stableJSONStringify = (obj: any, space = 2): string => {
  const clone = cloneDeep(obj);

  if (clone && clone.fields) {
    clone.fields = sortFields(clone.fields);
  }

  const keys: string[] = [];

  JSON.stringify(clone, (key, value) => {
    if (key === '__typename') {
      return undefined;
    }

    keys.push(key);

    return value;
  });

  const priorityKeys: string[] = [
    'id',
    'name',
    'title',
    'type',
    'priority',
    'description',
    'settings',
    'groups',
    'fields',
    'createdAt',
    'updatedAt',
    'data',
  ];

  // Sort the keys based on priority attributes, falling back to an alphabetical sort otherwise
  keys.sort((a, b) => {
    if (priorityKeys.includes(a) || priorityKeys.includes(b)) {
      return priorityKeys.indexOf(a) - priorityKeys.indexOf(b);
    }

    const aNormalized = a.toUpperCase();
    const bNormalized = b.toUpperCase();

    if (aNormalized < bNormalized) {
      return -1;
    }

    if (aNormalized > bNormalized) {
      return 1;
    }

    return 0;
  });

  return JSON.stringify(clone, keys, space);
};

/**
 *
 */
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
