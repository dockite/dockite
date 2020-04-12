import { DockiteField } from '@dockite/field';
import { GraphQLScalarType, GraphQLString } from 'graphql';

export class DockiteFieldString extends DockiteField {
  public static type = 'string';

  public static title = 'String';

  public static description = 'A string field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLScalarType> {
    return GraphQLString;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLScalarType> {
    return GraphQLString;
  }

  public async outputType(): Promise<GraphQLScalarType> {
    return GraphQLString;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
