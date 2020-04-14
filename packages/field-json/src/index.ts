import { DockiteField } from '@dockite/field';
import { GraphQLScalarType, GraphQLString } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

export class DockiteFieldJSON extends DockiteField {
  public static type = 'json';

  public static title = 'JSON';

  public static description = 'A JSON field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLScalarType> {
    return GraphQLJSON;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLScalarType> {
    return GraphQLJSON;
  }

  public async outputType(): Promise<GraphQLScalarType> {
    return GraphQLJSON;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
