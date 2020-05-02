import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLObjectType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { Schema } from '@dockite/types';

export class DockiteFieldJSON extends DockiteField {
  public static type = 'json';

  public static title = 'JSON';

  public static description = 'A JSON field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return GraphQLJSON;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLJSON;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return GraphQLJSON;
  }
}
