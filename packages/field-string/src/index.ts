import { DockiteField } from '@dockite/field';
import { GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLString } from 'graphql';

export class DockiteFieldString extends DockiteField {
  public static type = 'string';

  public static title = 'String';

  public static description = 'A string field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputFieldConfig> {
    return {
      type: GraphQLString,
    };
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputFieldConfig> {
    return {
      type: GraphQLString,
    };
  }

  public async outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>> {
    return {
      type: GraphQLString,
    };
  }

  // public async processOutput<Input, Output>(data: Input): Promise<Output> {
  //   return data;
  // }
}
