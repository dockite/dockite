import { DockiteField } from '../common';

import { Schema } from './schema';

export interface FieldSettings {
  default?: any;
  [key: string]: any;
}

export interface Field {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  settings: FieldSettings;
  schemaId: string;
  schema?: Schema;
  dockiteField?: DockiteField;
}
