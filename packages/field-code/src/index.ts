import { DockiteField } from '@dockite/field';
import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
} from 'graphql';

import { defaultOptions, FIELD_TYPE } from './types';

const DockiteFieldCodeType = new GraphQLObjectType({
  name: 'DockiteFieldCode',
  fields: {
    language: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

const DockiteFieldCodeInputType = new GraphQLInputObjectType({
  name: 'DockiteFieldCodeInput',
  fields: {
    language: { type: GraphQLString },
    content: { type: GraphQLString },
  },
});

export class DockiteFieldCode extends DockiteField {
  public static type = FIELD_TYPE;

  public static title = 'Code';

  public static description = 'A code field with syntax highlighting';

  public static defaultOptions = defaultOptions;

  public async inputType(): Promise<GraphQLInputType> {
    return DockiteFieldCodeInputType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    return DockiteFieldCodeType;
  }
}
