import { Field } from '@dockite/types';
import { TreeData } from 'element-ui/types/tree';

export type UnpersistedField = Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;

export interface FieldTreeData extends TreeData {
  dockite: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>;
  children?: FieldTreeData[];
}
