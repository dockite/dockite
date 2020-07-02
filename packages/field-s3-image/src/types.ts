export interface S3ImageType {
  name: string;
  url: string;
  alt: string;
  size: number;
  type: string;
  checksum: string;
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

export interface FieldSettings extends S3Settings {
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
  limit: number;
  useSchemaS3Settings: boolean;
}
