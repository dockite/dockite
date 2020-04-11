import { DockiteField } from '@dockite/field';
import { GraphQLScalarType } from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';

export class DockiteFieldDatetime extends DockiteField {
  public static type = 'datetime';

  public static title = 'Datetime';

  public static description = 'A datetime field.';

  public static defaultOptions = {};

  private graphqlType() {
    return this.schemaField.settings.datetime ? GraphQLDate : GraphQLDateTime
  }

  public async inputType(): Promise<GraphQLScalarType> {
    return this.graphqlType();
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLScalarType> {
    return this.graphqlType();
  }

  public async outputType<Source, Context>(): Promise<GraphQLScalarType> {
    return this.graphqlType();
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
