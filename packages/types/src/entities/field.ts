import { DockiteField } from '../common';

import { Schema } from './schema';

export interface Field {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  settings: any; // eslint-disable-line
  schemaId: string;
  schema: Schema;
  dockiteField?: DockiteField;
}
