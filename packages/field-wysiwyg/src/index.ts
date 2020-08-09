import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType, GraphQLString } from 'graphql';

import { WysiwygFieldSettings } from './types';

const DockiteFieldWysiwygType = new GraphQLScalarType({
  ...GraphQLString.toConfig(),
  name: 'DockiteFieldWysiwyg',
});

export class DockiteFieldWysiwyg extends DockiteField {
  public static type = 'wysiwyg';

  public static title = 'Wysiwyg';

  public static description = 'A wysiwyg field';

  public static defaultOptions: WysiwygFieldSettings = {
    required: false,
    extensions: [],
    minLen: 0,
    maxLen: 0,
  };

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldWysiwygType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldWysiwygType;
  }
}
