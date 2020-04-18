import { GraphQLInputType, GraphQLOutputType, GraphQLObjectType } from 'graphql';

import { Schema } from '../entities';

export interface DockiteField {
  inputType(): Promise<GraphQLInputType>;

  // processInput<Input, Output>(data: Input): Promise<Output>;

  where(): Promise<GraphQLInputType>;

  outputType(
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType>;

  processOutput<T>(data: any): Promise<T>;
}
