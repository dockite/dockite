import { DockiteField } from '@dockite/field';
import { GraphQLFloat, GraphQLInt, GraphQLScalarType } from 'graphql';

export class DockiteFieldNumber extends DockiteField {
  public static type = 'number';

  public static title = 'Number';

  public static description = 'A number field, allowing for either whole or decimal numbers.';

  public static defaultOptions = {};

  private graphqlType() {
    return this.schemaField.settings.float ? GraphQLFloat : GraphQLInt
  }

  public async inputType(): Promise<GraphQLScalarType> {
    return this.graphqlType();
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLScalarType> {
    return this.graphqlType();
  }

  public async outputType<Source, Context>(): Promise<GraphQLScalarType> {
    return this.graphqlType();
  }

  public async processOutput<T>(data: any): Promise<T> {
    console.log(this);
    return data[this.schemaField.name] as T;
  }
}
