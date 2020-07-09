import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
} from 'graphql';
import typeorm from 'typeorm';

import { Field, Schema, Document } from '../entities';

export interface FieldIOContext {
  dockiteFields: Record<string, DockiteFieldStatic>;
  dockiteSchemas: Schema[];
  graphqlTypes: Map<string, GraphQLObjectType>;
}

export interface FieldContext {
  field: Field;
  fieldData: any;
  data: Record<string, any>;
  args?: Record<string, any>;
  document?: Document;
}

export interface HookContext {
  field: Field;
  fieldData: any;
  data: Record<string, any>;
  document?: Document;
}

export interface HookContextWithOldData extends HookContext {
  oldData?: Record<string, any>;
}

export interface DockiteFieldStatic {
  type: string;
  title: string;
  description: string;
  defaultOptions: object;

  new (
    schemaField: Field,
    orm: typeof typeorm,
    fieldManager: Record<string, DockiteFieldStatic>,
  ): DockiteField;
}

export interface DockiteField {
  inputType(ctx: FieldIOContext): Promise<GraphQLInputType>;

  processInput<T>(ctx: HookContextWithOldData): Promise<T>;

  validateInput(ctx: HookContextWithOldData): Promise<void>;

  processInputRaw<T>(ctx: HookContextWithOldData): Promise<T>;

  validateInputRaw(ctx: HookContextWithOldData): Promise<void>;

  processInputGraphQL<T>(ctx: FieldContext): Promise<T>;

  validateInputGraphQL(ctx: HookContextWithOldData): Promise<void>;

  outputType(ctx: FieldIOContext): Promise<GraphQLOutputType>;

  outputArgs(): Promise<GraphQLFieldConfigArgumentMap>;

  processOutputRaw<T>(ctx: HookContext): Promise<T>;

  processOutputGraphQL<T>(ctx: FieldContext): Promise<T>;

  processOutput<T>(ctx: HookContext): Promise<T>;

  onCreate(ctx: HookContext): Promise<void>;

  onUpdate(ctx: HookContextWithOldData): Promise<void>;

  onSoftDelete(ctx: HookContext): Promise<void>;

  onPermanentDelete(ctx: HookContext): Promise<void>;
}
