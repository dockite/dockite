import { DockiteField } from '@dockite/field';
import { GraphQLFieldConfig, GraphQLFloat, GraphQLInputFieldConfig, GraphQLInt } from 'graphql';

export class DociteFieldNumber extends DockiteField {
  public static type = 'number';

  public static title = 'Number';

  public static description = 'A number field, allowing for either whole or decimal numbers.';

  public static defaultOptions = {};

  private graphqlType() {
    return this.schemaField.settings.float ? GraphQLFloat : GraphQLInt
  }

  public async inputType(): Promise<GraphQLInputFieldConfig> {
    return {
      type: this.graphqlType(),
    };
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputFieldConfig> {
    return {
      type: this.graphqlType(),
    };
  }

  public async outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>> {
    return {
      type: this.graphqlType(),
    };
  }

  // public async processOutput<Input, Output>(data: Input): Promise<Output> {
  //   return data;
  // }
}
