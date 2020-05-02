import { Field } from '@dockite/types';

export interface DockiteFormField
  extends Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'> {
  id?: string;
}
