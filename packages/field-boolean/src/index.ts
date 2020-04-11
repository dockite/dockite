import { DockiteField } from '@dockite/field';
import { GraphQLBoolean, GraphQLScalarType } from 'graphql';

export class DockiteFieldBoolean extends DockiteField {
  public static type = 'boolean';

  public static title = 'Boolean';

  public static description = 'A boolean field, rendered as a checkbox';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLScalarType> {
    return GraphQLBoolean;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLScalarType> {
    return GraphQLBoolean;
  }

  public async outputType<Source, Context>(): Promise<GraphQLScalarType> {
    return GraphQLBoolean;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
