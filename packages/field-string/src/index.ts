import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType, GraphQLOutputType, GraphQLString, GraphQLObjectType, GraphQLScalarType,
} from 'graphql';
import { Schema } from '@dockite/types';

const DockiteFieldStringType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldString',
});

export class DockiteFieldString extends DockiteField {
  public static type = 'string';

  public static title = 'String';

  public static description = 'A string field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldStringType;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return DockiteFieldStringType;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return DockiteFieldStringType;
  }
}
