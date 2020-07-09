import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType, GraphQLString } from 'graphql';

import { StringFieldSettings } from './types';

const DockiteFieldStringType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldString',
});

export class DockiteFieldString extends DockiteField {
  public static type = 'string';

  public static title = 'String';

  public static description = 'A string field';

  public static defaultOptions: StringFieldSettings = {
    required: false,
    textarea: false,
    urlSafe: false,
    minLen: 0,
    maxLen: 0,
  };

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldStringType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldStringType;
  }
}
