import Ajv from 'ajv';

import { SupportedOperators } from './types';

export const ajv = new Ajv({ allErrors: true });

export const validationSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',

  definitions: {
    constraint: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          // eslint-disable-next-line
          pattern: '^[_A-Za-z][_0-9A-Za-z]*(.[_A-Za-z][_0-9A-Za-z]*)*$',
        },
        operator: {
          type: 'string',
          enum: SupportedOperators,
        },
        value: {
          type: 'string',
        },
      },
      required: ['name', 'operator', 'value'],
    },
    constraintArray: {
      type: 'array',
      items: {
        anyOf: [
          {
            $ref: '#/definitions/constraint',
          },
          {
            $ref: '#/definitions/orQuery',
          },
          {
            $ref: '#/definitions/andQuery',
          },
        ],
      },
      minItems: 1,
      additionalItems: false,
    },
    orQuery: {
      type: 'object',
      properties: {
        OR: {
          $ref: '#/definitions/constraintArray',
        },
      },
      required: ['OR'],
      additionalProperties: false,
    },
    andQuery: {
      type: 'object',
      properties: {
        AND: {
          $ref: '#/definitions/constraintArray',
        },
      },
      required: ['AND'],
      additionalProperties: false,
    },
  },

  oneOf: [
    {
      $ref: '#/definitions/andQuery',
    },
    {
      $ref: '#/definitions/orQuery',
    },
  ],
};

export const validator = ajv.compile(validationSchema);
