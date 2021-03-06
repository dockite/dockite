import { DockiteField } from '@dockite/field';
import {
  GraphQLBoolean, GraphQLInputType, GraphQLOutputType, GraphQLScalarType,
} from 'graphql';

const DockiteFieldBooleanType = new GraphQLScalarType({
  ...GraphQLBoolean.toConfig(),
  name: 'DockiteFieldBoolean',
});

export class DockiteFieldBoolean extends DockiteField {
  public static type = 'boolean';

  public static title = 'Boolean';

  public static description = 'A boolean field, rendered as a checkbox';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldBooleanType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldBooleanType;
  }
}
