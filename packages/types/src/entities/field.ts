import { DockiteField } from '../common';

import { Schema } from './schema';

export interface FieldSettings extends Record<string, any> {
  default: any;
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
