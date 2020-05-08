import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType, GraphQLOutputType, GraphQLObjectType, GraphQLScalarType,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { Schema } from '@dockite/types';

const DockiteFieldJSONType = new GraphQLScalarType({
  ...GraphQLJSON.toConfig(),
  name: 'DockiteFieldJSON',
});

export class DockiteFieldJSON extends DockiteField {
  public static type = 'json';

  public static title = 'JSON';

  public static description = 'A JSON field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldJSONType;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return DockiteFieldJSONType;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return DockiteFieldJSONType;
  }
}
