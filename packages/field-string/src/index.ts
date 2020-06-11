import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType, GraphQLOutputType, GraphQLScalarType, GraphQLString,
} from 'graphql';

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

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldStringType;
  }
}
