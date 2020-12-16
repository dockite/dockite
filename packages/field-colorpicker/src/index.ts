import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import { HexColorCodeResolver as HexColorCode } from 'graphql-scalars';

import { defaultOptions, FIELD_TYPE } from './types';

const DockiteFieldColorType = new GraphQLScalarType({
  ...HexColorCode.toConfig(),
  name: 'DockiteFieldColor',
});

export class DockiteFieldColorPicker extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Colorpicker';

  public static description = 'A colorpicker field';

  public static defaultOptions = defaultOptions;

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldColorType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldColorType;
  }
}
