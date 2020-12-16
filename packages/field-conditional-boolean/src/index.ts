import { DockiteField } from '@dockite/field';
import { GraphQLBoolean, GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';

import { defaultOptions, FIELD_TYPE } from './types';

const DockiteFieldConditionalBooleanType = new GraphQLScalarType({
  ...GraphQLBoolean.toConfig(),
  name: 'DockiteFieldConditionalBoolean',
});

export class DockiteFieldConditionalBoolean extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Conditional Boolean';

  public static description =
    'A boolean field that shows or hides groups and fields. Rendered as a checkbox';

  public static defaultOptions = defaultOptions;

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldConditionalBooleanType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldConditionalBooleanType;
  }
}
