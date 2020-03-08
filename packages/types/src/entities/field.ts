import { Schema } from '.';

export interface Field {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  settings: any; // eslint-disable-line
  schemaId: string;
  schema: Schema;
}
