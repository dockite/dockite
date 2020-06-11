import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLScalarType } from 'graphql';
import { HexColorCodeResolver as HexColorCode } from 'graphql-scalars';

const DockiteFieldColorType = new GraphQLScalarType({
  ...HexColorCode.toConfig(),
  name: 'DockiteFieldColor',
});

export class DockiteFieldColorPicker extends DockiteField {
  public static type = 'colorpicker';

  public static title = 'Colorpicker';

  public static description = 'A colorpicker field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldColorType;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return DockiteFieldColorType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldColorType;
  }
}
