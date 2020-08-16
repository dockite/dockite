import { Field } from '@dockite/database';

export const DEFAULT_OPTIONS: MediaManagerFieldSettings = {
  acceptedExtensions: [],
  maxSizeKB: 10000,
  max: 0,
  useSchemaS3Settings: false,
  accessKey: '',
  secretAccessKey: '',
  endpoint: 's3.amazonaws.com',
  bucket: '',
  pathPrefix: null,
  overrideBaseUrl: null,
  public: false,
};

export interface S3Settings {
  accessKey: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
}

export interface MediaManagerItem {
  url: string;
  path: string;
  filename: string;
  size: number;
  type: string;
  checksum: string;
}

export interface MediaManagerValue {
  uid: string;
  items: MediaManagerItem[];
}

export interface MediaManagerFieldSettings extends S3Settings {
  acceptedExtensions: string[];
  maxSizeKB: number;
  max: number;
  useSchemaS3Settings: boolean;
  pathPrefix: string | null;
  overrideBaseUrl: string | null;
  public: boolean;
}

export interface DockiteFieldMediaManagerEntity extends Field {
  settings: MediaManagerFieldSettings & Field['settings'];
}
