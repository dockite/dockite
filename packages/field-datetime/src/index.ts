import { DockiteField } from '@dockite/field';
import { FieldContext } from '@dockite/types';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';

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

  public async outputType(): Promise<GraphQLOutputType> {
    return this.graphqlType();
  }

  public async processOutput<T>({ fieldData }: FieldContext): Promise<T> {
    return (new Date(fieldData) as any) as T;
  }
}
