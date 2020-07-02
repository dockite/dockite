import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLList,
} from 'graphql';

import { FieldSettings } from './types';

export interface S3ImageType {
  name: string;
  url: string;
  alt: string;
  size: number;
  type: string;
  checksum: string;
}

export type MultipleS3ImageType = S3ImageType[];

const DockiteFieldS3ImageType = new GraphQLObjectType({
  name: 'DockiteFieldS3ImageType',
  fields: {
    name: { type: GraphQLString },
    url: { type: GraphQLString },
    alt: { type: GraphQLString },
    size: { type: GraphQLInt },
    type: { type: GraphQLString },
    checksum: { type: GraphQLString },
  },
});

const MultipleDockiteFieldS3ImageType = new GraphQLList(DockiteFieldS3ImageType);

export class DockiteFieldS3Image extends DockiteField {
  public static type = 's3-image';

  public static title = 'S3 Image';

  public static description = 'An image field that uploads files to an S3 compatible storage.';

  public static defaultOptions: FieldSettings = {
    required: false,
    acceptedExtensions: [],
    maxSizeKB: 10000,
    imageValidation: false,
    minHeight: null,
    maxHeight: null,
    minWidth: null,
    maxWidth: null,
    ratio: null,
    multiple: false,
    limit: 1,
    useSchemaS3Settings: false,
    accessKey: '',
    secretAccessKey: '',
    endpoint: 's3.amazonaws.com',
    bucket: '',
  };

  public async inputType(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  public async where(): Promise<GraphQLInputType> {
    return GraphQLString;
  }

  // public async processInput<Input, Output>(data: Input): Promise<Output> {}

  public async outputType(): Promise<GraphQLOutputType> {
    if ((this.schemaField.settings as FieldSettings).multiple) {
      return MultipleDockiteFieldS3ImageType;
    }

    return DockiteFieldS3ImageType;
  }
}
