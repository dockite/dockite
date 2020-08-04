import Ajv from 'ajv';

export const ajv = new Ajv({ allErrors: true });

export const validationSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    groups: {
      type: 'array',
      items: [
        {
          type: 'object',
          minProperties: 1,
          maxProperties: 1,
          patternProperties: {
            '^.*$': {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
              ],
            },
          },
        },
      ],
    },
    settings: {
      type: 'object',
    },
    fields: {
      type: 'array',
      items: [
        {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
              // eslint-disable-next-line
              pattern: '^[_A-Za-z][_0-9A-Za-z]*$',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            type: {
              type: 'string',
            },
            settings: {
              type: 'object',
              properties: {
                children: {
                  type: 'array',
                  items: [
                    {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          // eslint-disable-next-line
                          pattern: '^[_A-Za-z][_0-9A-Za-z]*$',
                        },
                        type: {
                          type: 'string',
                        },
                        title: {
                          type: 'string',
                        },
                        settings: {
                          type: 'object',
                        },
                        description: {
                          type: 'string',
                        },
                      },
                      required: ['name', 'type', 'title', 'settings', 'description'],
                    },
                  ],
                },
              },
            },
          },
          required: ['name', 'title', 'description', 'type', 'settings'],
        },
      ],
    },
  },
  required: ['name', 'title', 'groups', 'settings', 'fields'],
};

export const validator = ajv.compile(validationSchema);
