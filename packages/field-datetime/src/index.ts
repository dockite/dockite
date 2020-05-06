import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLObjectType, GraphQLScalarType } from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { Schema, FieldContext } from '@dockite/types';

const DockiteFieldDateType = new GraphQLScalarType({
  ...GraphQLDate.toConfig(),
  name: 'DockiteFieldDate',
});

const DockiteFieldDateTimeType = new GraphQLScalarType({
  ...GraphQLDateTime.toConfig(),
  name: 'DockiteFieldDateTime',
});

export class DockiteFieldDatetime extends DockiteField {
  public static type = 'datetime';

  public static title = 'Datetime';

  public static description = 'A datetime field.';

  public static defaultOptions = {};

  private graphqlType() {
    return this.schemaField.settings.date ? DockiteFieldDateType : DockiteFieldDateTimeType;
  }

  public async inputType(): Promise<GraphQLInputType> {
    return this.graphqlType();
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return this.graphqlType();
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return this.graphqlType();
  }

  public async processOutput<T>({ value }: FieldContext): Promise<T> {
    return (new Date(value) as any) as T;
  }
}
