import { GraphQLFieldConfig, GraphQLInputFieldConfig } from 'graphql';
import { Field } from '@dockite/types';
import { Repository } from 'typeorm';
import { Component } from 'vue';

export interface DockiteFieldStatic {
  type: string;
  title: string;
  description: string;
  defaultOptions: object;

  new (schemaField: Field, repositories: { [id: string]: Repository<any> }): DockiteField;
}

export abstract class DockiteField {
  public static type: string;

  public static title: string;

  public static description: string;

  public static defaultOptions = {};

  constructor(
    protected schemaField: Field,
    protected repositories: { [id: string]: Repository<any> },
  ) {
    this.schemaField = schemaField;
    this.repositories = repositories;
  }

  public abstract inputType(): Promise<GraphQLInputFieldConfig>;

  // public abstract processInput<Input, Output>(data: Input): Promise<Output>;

  public abstract where(): Promise<GraphQLInputFieldConfig>;

  public abstract outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>>;

  // public abstract processOutput<Input, Output>(data: Input): Promise<Output>;
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
