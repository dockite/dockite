import { BaseField } from '@dockite/database';

export interface S3ImageType {
  name: string;
  url: string;
  alt: string;
  size: number;
  type: string;
  checksum: string;
  path: string;
}

export type MultipleS3ImageType = S3ImageType[];

export const imageTypeExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp '] as const;

export type ImageExtension = typeof imageTypeExtensions[number];

export interface S3Settings {
  accessKey: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
}

export interface S3ImageFieldSettings extends S3Settings {
  required: boolean;
  acceptedExtensions: ImageExtension[];
  maxSizeKB: number;
  imageValidation: false;
  minWidth: number | null;
  maxWidth: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  ratio: number | null;
  multiple: boolean;
  min: number;
  max: number;
  useSchemaS3Settings: boolean;
  pathPrefix: string | null;
  public: boolean;
}

export interface DockiteFieldS3ImageEntity extends BaseField {
  type: 's3-image';
  settings: S3ImageFieldSettings & BaseField['settings'];
}
