import { DockiteField } from '@dockite/field';
import { FieldContext } from '@dockite/types';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';

import { DateFieldSettings } from './types';

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

export class DockiteFieldDatetime extends DockiteField {
  public static type = 'datetime';

  public static title = 'Datetime';

  public static description = 'A datetime field.';

  public static defaultOptions: DateFieldSettings = {
    date: false,
    time: false,
    required: false,
  };

  private graphqlType() {
    const settings = this.schemaField.settings as DateFieldSettings;

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
