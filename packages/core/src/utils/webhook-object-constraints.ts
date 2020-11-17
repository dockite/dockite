/* eslint-disable @typescript-eslint/camelcase */
import { WebhookConstraint, WebhookConstraintOperator } from '@dockite/database';
import { isEqual, get } from 'lodash';

import { unsafeStringToNativeType } from './string-to-native';

type ConstraintHandler = (value: any, comparison: any) => boolean;

const handlers: Record<WebhookConstraintOperator, ConstraintHandler> = {
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

export const meetsObjectConstraints = (
  object: Record<string, any>,
  constraints: WebhookConstraint[],
): boolean => {
  return constraints.every(constraint => {
    const result = handlers[constraint.operator](
      get(object, constraint.name),
      unsafeStringToNativeType(constraint.value),
    );

    return result;
  });
};
