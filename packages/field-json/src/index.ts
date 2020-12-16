import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import { FIELD_TYPE, defaultOptions } from './types';

const DockiteFieldJSONType = new GraphQLScalarType({
  ...GraphQLJSON.toConfig(),
  name: 'DockiteFieldJSON',
});

export class DockiteFieldJSON extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'JSON';

  public static description = 'A JSON field';

  public static defaultOptions = {
    ...defaultOptions,
  };

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldJSONType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldJSONType;
  }
}
