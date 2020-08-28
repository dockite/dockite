import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import { IDFieldSettings } from './types';

const DockiteFieldIntegerIDType = new GraphQLScalarType({
  ...GraphQLInt.toConfig(),
  name: 'DockiteFieldIntegerID',
});

const DockiteFieldStringIDType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldStringID',
});

export class DockiteFieldID extends DockiteField {
  public static type = 'id';

  public static title = 'ID';

  public static description = 'An ID field only writable via the API';

  public static defaultOptions: IDFieldSettings = {
    required: false,
    type: 'string',
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
}
