import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLObjectType,
  GraphQLFieldConfigArgumentMap,
  GraphQLSchema,
} from 'graphql';
import { Repository } from 'typeorm';

import { Schema, Field } from '../entities';

export interface FieldContext {
  value: any;
  root: Record<string, any>;
  args: Record<string, any>;
  context: Record<string, any>;
}

export interface DockiteFieldStatic {
  type: string;
  title: string;
  description: string;
  defaultOptions: object;

  new (
    schemaField: Field,
    repositories: { [id: string]: Repository<any> },
    schema: GraphQLSchema | null,
  ): DockiteField;
}

export interface DockiteField {
  inputType(): Promise<GraphQLInputType>;

  // processInput<Input, Output>(data: Input): Promise<Output>;

  where(): Promise<GraphQLInputType>;

  outputType(
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
    dockiteFields: Record<string, DockiteFieldStatic>,
  ): Promise<GraphQLOutputType>;

  outputArgs(): Promise<GraphQLFieldConfigArgumentMap>;

  processOutput<T>(context: FieldContext): Promise<T>;
}
