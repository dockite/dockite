import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType, GraphQLString } from 'graphql';

import { defaultOptions, FIELD_TYPE } from './types';

const DockiteFieldWysiwygType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldWysiwyg',
});

export class DockiteFieldWysiwyg extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Wysiwyg';

  public static description = 'A wysiwyg field';

  public static defaultOptions = defaultOptions;

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldWysiwygType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldWysiwygType;
  }
}
