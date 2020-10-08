import { DockiteField } from '@dockite/field';
import { GraphQLBoolean, GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';

import { ConditionalBooleanSettings } from './types';

const DockiteFieldConditionalBooleanType = new GraphQLScalarType({
  ...GraphQLBoolean.toConfig(),
  name: 'DockiteFieldConditionalBoolean',
});

export class DockiteFieldConditionalBoolean extends DockiteField {
  public static type = 'conditional_boolean';

  public static title = 'Conditional Boolean';

  public static description =
    'A boolean field that shows or hides groups and fields. Rendered as a checkbox';

  public static defaultOptions: ConditionalBooleanSettings = {
    required: false,
    groupsToHide: [],
    fieldsToHide: [],
    fieldsToShow: [],
    groupsToShow: [],
  };

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldConditionalBooleanType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldConditionalBooleanType;
  }
}
