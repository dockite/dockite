import { GraphQLJSONObject } from 'graphql-type-json';
import { GraphQLScalarType } from 'graphql';

import { validator } from './validation';

function ensureObject(value: any): value is Record<string, any> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(`JSONObject cannot represent non-object value: ${value}`);
  }

  return value;
}

export const WhereBuilderInputType = new GraphQLScalarType({
  ...GraphQLJSONObject.toConfig(),

  name: 'WhereBuilderInputType',

  serialize(value: any): Record<string, any> {
    if (ensureObject(value)) {
      const valid = validator(value);

      if (!valid) {
        throw new Error('Invalid input provided');
      }

      return value;
    }

    throw new Error('Unexpected Code Path');
  },

  parseValue(value: any): Record<string, any> {
    if (ensureObject(value)) {
      const valid = validator(value);

      if (!valid) {
        throw new Error('Invalid input provided');
      }

      return value;
    }

    throw new Error('Unexpected Code Path');
  },

  parseLiteral(ast, variables): Record<string, any> {
    const value = GraphQLJSONObject.parseLiteral(ast, variables);

    const valid = validator(value);

    if (!valid) {
      throw new Error('Invalid input provided');
    }

    return value;
  },
});
