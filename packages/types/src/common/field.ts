import { GraphQLScalarType } from 'graphql';

export interface DockiteField {
  inputType(): Promise<GraphQLScalarType>;

  // processInput<Input, Output>(data: Input): Promise<Output>;

  where(): Promise<GraphQLScalarType>;

  outputType(): Promise<GraphQLScalarType>;

  processOutput<T>(data: any): Promise<T>;
}
