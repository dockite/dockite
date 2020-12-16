import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';
import { FieldContext, DockiteFieldValidationError } from '@dockite/types';

import { IDFieldSettings, FIELD_TYPE, defaultOptions } from './types';

const DockiteFieldIntegerIDType = new GraphQLScalarType({
  ...GraphQLInt.toConfig(),
  name: 'DockiteFieldIntegerID',
});

const DockiteFieldStringIDType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldStringID',
});

export class DockiteFieldID extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'ID';

  public static description = 'An ID field only writable via the API';

  public static defaultOptions: IDFieldSettings = {
    ...defaultOptions,
  };

  public async inputType(): Promise<GraphQLInputType> {
    const settings = this.schemaField.settings as IDFieldSettings;

    if (settings.type === 'number') {
      return DockiteFieldIntegerIDType;
    }

    return DockiteFieldStringIDType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    const settings = this.schemaField.settings as IDFieldSettings;

    if (settings.type === 'number') {
      return DockiteFieldIntegerIDType;
    }

    return DockiteFieldStringIDType;
  }

  public async validateInput(ctx: FieldContext): Promise<void> {
    const settings = this.schemaField.settings as IDFieldSettings;

    if (settings.required && !ctx.fieldData) {
      throw new DockiteFieldValidationError(
        'REQUIRED',
        `${this.schemaField.title} is required.`,
        ctx.path || this.schemaField.name,
      );
    }
  }
}
