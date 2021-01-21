import { DockiteField } from '@dockite/field';
import { FieldContext } from '@dockite/types';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';

import { DateTimeFieldSettings, defaultOptions, FIELD_TYPE } from './types';

const DockiteFieldDateType = new GraphQLScalarType({
  ...GraphQLDate.toConfig(),
  name: 'DockiteFieldDate',
});

const DockiteFieldTimeType = new GraphQLScalarType({
  ...GraphQLTime.toConfig(),
  name: 'DockiteFieldTime',
});

const DockiteFieldDateTimeType = new GraphQLScalarType({
  ...GraphQLDateTime.toConfig(),
  name: 'DockiteFieldDateTime',
});

export class DockiteFieldDateTime extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Datetime';

  public static description = 'A datetime field.';

  public static defaultOptions = defaultOptions;

  private graphqlType(): GraphQLScalarType {
    const settings = this.schemaField.settings as DateTimeFieldSettings;

    if (settings.date) {
      return DockiteFieldDateType;
    }

    if (settings.time) {
      return DockiteFieldTimeType;
    }

    return DockiteFieldDateTimeType;
  }

  public async inputType(): Promise<GraphQLInputType> {
    return this.graphqlType();
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return this.graphqlType();
  }

  public async processOutputGraphQL<T>({ fieldData }: FieldContext): Promise<T> {
    return (new Date(fieldData) as any) as T;
  }
}
