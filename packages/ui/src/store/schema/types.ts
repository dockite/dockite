import { SchemaType } from '@dockite/types';

import { DockiteFormField } from '@/common/types';

export interface SchemaState {
  schemaId: string | null;
}

export interface CreateSchemaPayload {
  name: string;
  type: SchemaType;
  groups: Record<string, string[]>;
  settings: Record<string, any>; // eslint-disable-line
  fields: DockiteFormField[];
}

export interface UpdateSchemaPayload {
  id: string;
  groups: Record<string, string[]>;
  settings: Record<string, any>; // eslint-disable-line
  fields: DockiteFormField[];
  deletedFields: DockiteFormField[];
}
