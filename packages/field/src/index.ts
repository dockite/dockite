import { GraphQLFieldConfig, GraphQLInputFieldConfig } from 'graphql';
import { Field } from '@dockite/types';
import { Repository } from 'typeorm';

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

  public abstract inputType(): Promise<GraphQLInputFieldConfig | null>;

  public abstract processInput<Input, Output>(data: Input): Promise<Output>;

  public abstract where(): Promise<GraphQLInputFieldConfig | null>;

  public abstract outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>>;

  public abstract processOutput<Input, Output>(data: Input): Promise<Output>;
}
