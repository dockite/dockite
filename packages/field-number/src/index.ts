import { DockiteField } from '@dockite/field';
import {
  GraphQLFloat, GraphQLInputType, GraphQLInt, GraphQLOutputType, GraphQLScalarType,
} from 'graphql';

const DockiteFieldFloatType = new GraphQLScalarType({
  ...GraphQLFloat.toConfig(),
  name: 'DockiteFieldFloat',
});

const DockiteFieldIntType = new GraphQLScalarType({
  ...GraphQLInt.toConfig(),
  name: 'DockiteFieldInt',
});

export class DockiteFieldNumber extends DockiteField {
  public static type = 'number';

  public static title = 'Number';

  public static description = 'A number field, allowing for either whole or decimal numbers.';

  public static defaultOptions = {};

  private graphqlType(): GraphQLScalarType {
    return this.schemaField.settings.float ? DockiteFieldFloatType : DockiteFieldIntType;
  }

  public async inputType(): Promise<GraphQLInputType> {
    return this.graphqlType();
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return this.graphqlType();
  }
}
