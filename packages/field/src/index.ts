import { Field, Schema, FieldContext } from '@dockite/types';
import {
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfigArgumentMap,
} from 'graphql';
import { Repository } from 'typeorm';
import { Component } from 'vue';

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

export abstract class DockiteField {
  public static type: string;

  public static title: string;

  public static description: string;

  public static defaultOptions = {};

  constructor(
    protected schemaField: Field,
    protected repositories: { [id: string]: Repository<any> },
    protected schema: GraphQLSchema | null,
  ) {
    this.schemaField = schemaField;
    this.repositories = repositories;
    this.schema = schema;
  }

  public abstract inputType(): Promise<GraphQLInputType>;

  // public abstract processInput<Input, Output>(data: Input): Promise<Output>;

  public abstract where(): Promise<GraphQLInputType>;

  public abstract outputType(
    dockiteSchemas: Schema[],
    types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType>;

  public outputArgs(): Promise<GraphQLFieldConfigArgumentMap> {
    return Promise.resolve({});
  }

  public async processOutput<T>(context: FieldContext): Promise<T> {
    return context.value as T;
  }
}

export const registerField = (
  name: string,
  inputComponent: Component,
  settingsComponent: Component,
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
