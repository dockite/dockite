import { DockiteField } from '@dockite/field';
import { GraphQLFloat, GraphQLInputType, GraphQLInt, GraphQLOutputType, GraphQLScalarType, GraphQLObjectType } from 'graphql';
import { Schema } from '@dockite/types';

export class DockiteFieldNumber extends DockiteField {
  public static type = 'number';

  public static title = 'Number';

  public static description = 'A number field, allowing for either whole or decimal numbers.';

  public static defaultOptions = {};

  private graphqlType(): GraphQLScalarType {
    return this.schemaField.settings.float ? GraphQLFloat : GraphQLInt
  }

  public async inputType(): Promise<GraphQLInputType> {
    return this.graphqlType();
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return this.graphqlType();
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return this.graphqlType();
  }
}
