import { DockiteField } from '@dockite/field';
import { GraphQLInputType, GraphQLOutputType, GraphQLObjectType, GraphQLString, GraphQLInputObjectType } from 'graphql';
import { Schema } from '@dockite/types';

const DockiteFieldCodeType = new GraphQLObjectType({
  name: 'DockiteFieldCode',
  fields: {
    language: { type: GraphQLString },
    content: { type: GraphQLString },
  }
});

const DockiteFieldCodeInputType = new GraphQLInputObjectType({
  name: 'DockiteFieldCodeInput',
  fields: {
    language: { type: GraphQLString },
    content: { type: GraphQLString },
  }
});

export class DockiteFieldCode extends DockiteField {
  public static type = 'code';

  public static title = 'Code';

  public static description = 'A code field with syntax highlighting';

  public static defaultOptions = {};

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldCodeInputType;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async outputType(
    _dockiteSchemas: Schema[],
    _types: Map<string, GraphQLObjectType>,
  ): Promise<GraphQLOutputType> {
    return DockiteFieldCodeType;
  }
}
