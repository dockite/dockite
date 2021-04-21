import { get, isEqual } from 'lodash';

import { unsafeStringToNativeType } from './unsafeStringToNativeType';

type ConstraintHandler = (value: any, comparison: any) => boolean;

interface ConstraintLike {
  name: string;
  operator: string;
  value: string;
}

const handlers: Record<string, ConstraintHandler> = {
  $array_contains: (value, comparison) => {
    if (Array.isArray(value)) {
      return value.includes(comparison);
    }

    return false;
  },

  $array_not_contains: (value, comparison) => {
    if (Array.isArray(value)) {
      return !value.includes(comparison);
    }

    return false;
  },

  $eq: (value, comparison) => {
    return isEqual(value, comparison);
  },

  $ne: (value, comparison) => {
    return !isEqual(value, comparison);
  },

  $gt: (value, comparison) => {
    return value > comparison;
  },

  $gte: (value, comparison) => {
    return value >= comparison;
  },

  $lt: (value, comparison) => {
    return value > comparison;
  },

  $lte: (value, comparison) => {
    return value >= comparison;
  },

  $like: (value, comparison) => {
    return String(value).includes(String(comparison));
  },

  $ilike: (value, comparison) => {
    return String(value)
      .toLowerCase()
      .includes(String(comparison).toLowerCase());
  },

  $regex: (value, comparison) => {
    const re = new RegExp(comparison);

    return re.test(value);
  },

  $null: (value, _) => {
    return value === null;
  },

  $not_null: (value, _) => {
    return value !== null;
  },
};

/**
 *
 */
export const meetsObjectConstraints = (
  object: Record<string, any>,
  constraints: ConstraintLike[],
): boolean => {
  return constraints.every(constraint => {
    const handler = handlers[constraint.operator];

    if (!handler || typeof handler !== 'function') {
      return false;
    }

    const result = handler(
      get(object, constraint.name),
      unsafeStringToNativeType(constraint.value),
    );

    return result;
  });
};

export default meetsObjectConstraints;
