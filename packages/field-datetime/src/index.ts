import { DockiteField } from '@dockite/field';
import { GraphQLFieldConfig, GraphQLInputFieldConfig } from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';

export class DociteFieldDatetime extends DockiteField {
  public static type = 'datetime';

  public static title = 'Datetime';

  public static description = 'A datetime field.';

  public static defaultOptions = {};

  private graphqlType() {
    return this.schemaField.settings.datetime ? GraphQLDate : GraphQLDateTime
  }

  public async inputType(): Promise<GraphQLInputFieldConfig> {
    return {
      type: this.graphqlType(),
    };
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputFieldConfig> {
    return {
      type: this.graphqlType(),
    };
  }

  public async outputType<Source, Context>(): Promise<GraphQLFieldConfig<Source, Context>> {
    return {
      type: this.graphqlType(),
    };
  }

  // public async processOutput<Input, Output>(data: Input): Promise<Output> {
  //   return data;
  // }
}
