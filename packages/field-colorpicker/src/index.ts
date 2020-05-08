import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType, GraphQLOutputType, GraphQLObjectType, GraphQLScalarType,
} from 'graphql';
import { HexColorCodeResolver as HexColorCode } from 'graphql-scalars';
import { Schema } from '@dockite/types';

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

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return DockiteFieldColorType;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
