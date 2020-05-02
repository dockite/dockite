import { DockiteField } from '@dockite/field';
import { GraphQLBoolean, GraphQLInputType, GraphQLOutputType, GraphQLObjectType } from 'graphql';
import { Schema } from '@dockite/types';

export class DockiteFieldBoolean extends DockiteField {
  public static type = 'boolean';

  public static title = 'Boolean';

  public static description = 'A boolean field, rendered as a checkbox';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return GraphQLBoolean;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLBoolean;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return GraphQLBoolean;
  }
}
