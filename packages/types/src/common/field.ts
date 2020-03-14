import { GraphQLInputFieldConfig, GraphQLFieldConfig } from 'graphql';

export interface DockiteField {
  inputType(): Promise<GraphQLInputFieldConfig | null>;

  // processInput<Input, Output>(data: Input): Promise<Output>;

  where(): Promise<GraphQLInputFieldConfig | null>;

  outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>>;

  // processOutput<Input, Output>(data: Input): Promise<Output>;
}
