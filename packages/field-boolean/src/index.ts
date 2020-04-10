import { DockiteField } from '@dockite/field';
import { GraphQLBoolean, GraphQLFieldConfig, GraphQLInputFieldConfig } from 'graphql';

export class DociteFieldBoolean extends DockiteField {
  public static type = 'boolean';

  public static title = 'Boolean';

  public static description = 'A boolean field, rendered as a checkbox';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputFieldConfig> {
    return {
      type: GraphQLBoolean,
    };
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputFieldConfig> {
    return {
      type: GraphQLBoolean,
    };
  }

  public async outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>> {
    return {
      type: GraphQLBoolean,
    };
  }

  // public async processOutput<Input, Output>(data: Input): Promise<Output> {
  //   return data;
  // }
}
