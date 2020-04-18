import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLString, GraphQLObjectType } from 'graphql';
import { Schema } from '@dockite/types';

export class DockiteFieldString extends DockiteField {
  public static type = 'string';

  public static title = 'String';

  public static description = 'A string field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return GraphQLString;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
