import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLSchema,
} from 'graphql';
import typeorm from 'typeorm';

import { Field, Schema, Document, User } from '../entities';

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
  path?: string;
  user?: Omit<User, 'password' | 'handleNormalizeScopes' | 'can'>;
}

export interface HookContext {
  field: Field;
  fieldData: any;
  data: Record<string, any>;
  document?: Document;
  path?: string;
  user?: Omit<User, 'password' | 'handleNormalizeScopes' | 'can'>;
  draft?: boolean;
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
    graphqlSchemas: Record<string, GraphQLSchema>,
  ): DockiteField;
}

export interface DockiteField {
  defaultValue(): any;

  inputType(ctx: FieldIOContext): Promise<GraphQLInputType>;

  processInput<T = any>(ctx: HookContextWithOldData): Promise<T>;

  validateInput(ctx: HookContextWithOldData): Promise<void>;

  processInputRaw<T = any>(ctx: HookContextWithOldData): Promise<T>;

  validateInputRaw(ctx: HookContextWithOldData): Promise<void>;

  processInputGraphQL<T = any>(ctx: FieldContext): Promise<T>;

  validateInputGraphQL(ctx: HookContextWithOldData): Promise<void>;

  outputType(ctx: FieldIOContext): Promise<GraphQLOutputType>;

  outputArgs(): Promise<GraphQLFieldConfigArgumentMap>;

  processOutputRaw<T = any>(ctx: HookContext): Promise<T>;

  processOutputGraphQL<T = any>(ctx: FieldContext): Promise<T>;

  processOutput<T = any>(ctx: HookContext): Promise<T>;

  onCreate(ctx: HookContext): Promise<void>;

  onUpdate(ctx: HookContextWithOldData): Promise<void>;

  onSoftDelete(ctx: HookContext): Promise<void>;

  onPermanentDelete(ctx: HookContext): Promise<void>;

  onFieldCreate(): Promise<void>;

  onFieldUpdate(): Promise<void>;
}
