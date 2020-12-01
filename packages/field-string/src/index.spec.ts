/* eslint-env jest */
import { GraphQLScalarType, GraphQLSchema } from 'graphql';
import { DockiteFieldValidationError } from '@dockite/types';

import { DockiteFieldStringEntity } from './types';

import { DockiteFieldString } from '.';

const BaseDockiteFieldString: DockiteFieldStringEntity = {
  id: '123',
  type: 'string',
  name: 'string',
  title: 'String',
  description: '',
  schemaId: '123',
  settings: {
    required: false,
    textarea: false,
    urlSafe: false,
    minLen: 0,
    maxLen: 0,
  },
};

describe('DockiteFieldString', () => {
  it('creates the corresponding graphql types', async () => {
    const field = new DockiteFieldString(null as any, null as any, {}, new GraphQLSchema({}));

    const [inputType, outputType] = await Promise.all([field.inputType(), field.outputType()]);

    expect((inputType as GraphQLScalarType).name).toBe('DockiteFieldString');
    expect((outputType as GraphQLScalarType).name).toBe('DockiteFieldString');
  });

  it('validates minimum and maximum length', async () => {
    const DockiteFieldWithMinLen: DockiteFieldStringEntity = {
      ...BaseDockiteFieldString,
      settings: {
        ...BaseDockiteFieldString.settings,
        minLen: 5,
        maxLen: 12,
      },
    };

    const field = new DockiteFieldString(
      DockiteFieldWithMinLen,
      null as any,
      {},
      new GraphQLSchema({}),
    );

    const minLenResult: DockiteFieldValidationError = await field
      .validateInput({
        data: {},
        field: DockiteFieldWithMinLen,
        fieldData: 'min',
      })
      .catch(e => e);

    expect(minLenResult).toBeInstanceOf(DockiteFieldValidationError);
    expect(minLenResult.code).toBe('STR_MIN_LEN');

    const maxLenResult: DockiteFieldValidationError = await field
      .validateInput({
        data: {},
        field: DockiteFieldWithMinLen,
        fieldData: 'waypastthemaxlen',
      })
      .catch(e => e);

    expect(maxLenResult).toBeInstanceOf(DockiteFieldValidationError);
    expect(maxLenResult.code).toBe('STR_MAX_LEN');
  });

  it('validate url safety of input', async () => {
    const DockiteFieldWithUrlSafe: DockiteFieldStringEntity = {
      ...BaseDockiteFieldString,
      settings: {
        ...BaseDockiteFieldString.settings,
        urlSafe: true,
      },
    };

    const field = new DockiteFieldString(
      DockiteFieldWithUrlSafe,
      null as any,
      {},
      new GraphQLSchema({}),
    );

    const result = await field
      .validateInput({
        data: {},
        field: DockiteFieldWithUrlSafe,
        fieldData: '@#$',
      })
      .catch(e => e);

    expect(result).toBeInstanceOf(DockiteFieldValidationError);
    expect(result.code).toBe('STR_URL_SAFE');
  });
});
