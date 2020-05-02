import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLObjectType } from 'graphql';
import { HexColorCodeResolver as HexColorCode } from 'graphql-scalars';
import { Schema } from '@dockite/types';

export class DockiteFieldColorPicker extends DockiteField {
  public static type = 'colorpicker';

  public static title = 'Colorpicker';

  public static description = 'A colorpicker field';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return HexColorCode;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return HexColorCode;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return HexColorCode;
  }

  public async processOutput<T>(data: any): Promise<T> {
    return data[this.schemaField.name] as T;
  }
}
