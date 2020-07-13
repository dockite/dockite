import { DockiteField } from '@dockite/field';
import {
  GraphQLInputType,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';

import { S3ImageFieldSettings } from './types';

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

const DockiteFieldS3ImageInputType = new GraphQLInputObjectType({
  name: 'DockiteFieldS3ImageInputType',
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
const MultipleDockiteFieldS3ImageInputType = new GraphQLList(DockiteFieldS3ImageInputType);

export class DockiteFieldS3Image extends DockiteField {
  public static type = 's3-image';

  public static title = 'S3 Image';

  public static description = 'An image field that uploads files to an S3 compatible storage.';

  public static defaultOptions: S3ImageFieldSettings = {
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
    if ((this.schemaField.settings as S3ImageFieldSettings).multiple) {
      return MultipleDockiteFieldS3ImageInputType;
    }

    return DockiteFieldS3ImageInputType;
  }

  public async outputType(): Promise<GraphQLOutputType> {
    if ((this.schemaField.settings as S3ImageFieldSettings).multiple) {
      return MultipleDockiteFieldS3ImageType;
    }

    return DockiteFieldS3ImageType;
  }
}
