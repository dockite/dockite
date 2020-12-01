import {
  Field,
  FieldContext,
  FieldIOContext,
  HookContext,
  HookContextWithOldData,
  DockiteFieldStatic,
} from '@dockite/types';
import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLSchema,
} from 'graphql';
import typeorm from 'typeorm';
import { Component } from 'vue';

export abstract class DockiteField {
  public static type: string;

  public static title: string;

  public static description: string;

  public static defaultOptions = {};

  constructor(
    protected schemaField: Field,
    protected orm: typeof typeorm,
    protected fieldManager: Record<string, DockiteFieldStatic>,
    protected graphqlSchema: GraphQLSchema,
  ) {
    this.schemaField = schemaField;
    this.orm = orm;
    this.fieldManager = fieldManager;
    this.graphqlSchema = graphqlSchema;
  }

  public defaultValue(): any {
    return null;
  }

  public abstract inputType(ctx: FieldIOContext): Promise<GraphQLInputType>;

  public async processInput<T extends any>(ctx: HookContextWithOldData): Promise<T> {
    return ctx.fieldData as T;
  }

  public validateInput(_ctx: HookContextWithOldData): Promise<void> {
    return Promise.resolve();
  }

  public processInputRaw<T extends any>(ctx: HookContextWithOldData): Promise<T> {
    return this.processInput(ctx);
  }

  public validateInputRaw(ctx: HookContextWithOldData): Promise<void> {
    return this.validateInput(ctx);
  }

  public processInputGraphQL<T extends any>(ctx: FieldContext): Promise<T> {
    return this.processInput(ctx);
  }

  public validateInputGraphQL(ctx: HookContextWithOldData): Promise<void> {
    return this.validateInput(ctx);
  }

  public abstract outputType(ctx: FieldIOContext): Promise<GraphQLOutputType>;

  public outputArgs(): Promise<GraphQLFieldConfigArgumentMap> {
    return Promise.resolve({});
  }

  public async processOutput<T extends any>(ctx: HookContext): Promise<T> {
    return ctx.fieldData as T;
  }

  public processOutputRaw<T extends any>(ctx: HookContext): Promise<T> {
    return this.processOutput(ctx);
  }

  public processOutputGraphQL<T extends any>(ctx: FieldContext): Promise<T> {
    return this.processOutput(ctx);
  }

  public onCreate(_ctx: HookContext): Promise<void> {
    return Promise.resolve();
  }

  public onUpdate(_ctx: HookContextWithOldData): Promise<void> {
    return Promise.resolve();
  }

  public onSoftDelete(_ctx: HookContext): Promise<void> {
    return Promise.resolve();
  }

  public onPermanentDelete(_ctx: HookContext): Promise<void> {
    return Promise.resolve();
  }

  public onFieldCreate(): Promise<void> {
    return Promise.resolve();
  }

  public onFieldUpdate(): Promise<void> {
    return Promise.resolve();
  }
}

export const registerField = (
  name: string,
  inputComponent: Component | null,
  settingsComponent: Component | null,
): void => {
  if (typeof window === 'undefined') {
    throw new Error('registerField called in non-browser environment');
  }

  // eslint-disable-next-line
  const w = window as any;

  if (w.dockite && w.dockite.registerField) {
    w.dockite.registerField(name, inputComponent, settingsComponent);
  }
};
