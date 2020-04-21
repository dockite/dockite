import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLObjectType,
  GraphQLFieldConfigArgumentMap,
} from 'graphql';

import { Schema } from '../entities';

export interface FieldContext {
  value: any;
  root: Record<string, any>;
  args: Record<string, any>;
  context: Record<string, any>;
}

export interface DockiteField {
  inputType(): Promise<GraphQLInputType>;

  // processInput<Input, Output>(data: Input): Promise<Output>;

  where(): Promise<GraphQLInputType>;

  outputType(
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType>;

  outputArgs(): Promise<GraphQLFieldConfigArgumentMap>;

  processOutput<T>(context: FieldContext): Promise<T>;
}
