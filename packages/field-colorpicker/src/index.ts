import { DockiteField } from '@dockite/field';
import { GraphQLScalarType, GraphQLString } from 'graphql';
import { HexColorCodeResolver as HexColorCode } from 'graphql-scalars';

export class DockiteFieldColorPicker extends DockiteField {
  public static type = 'colorpicker';

  public static title = 'Colorpicker';

  public static description = 'A colorpicker field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLScalarType> {
    return HexColorCode;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLScalarType> {
    return HexColorCode;
  }

  public async outputType(): Promise<GraphQLScalarType> {
    return HexColorCode;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
