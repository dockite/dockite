import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface DockiteFieldGroupEntity extends BaseField {
  type: 'group';
  settings: GroupFieldSettings & BaseField['settings'];
}

export type ChildField = Omit<BaseField, 'id' | 'schema' | 'schemaId' | 'dockiteField'>;

export interface GroupFieldSettings extends FieldSettings {
  required: boolean;
  children: ChildField[];
  repeatable: boolean;
  minRows: number;
  maxRows: number;
}
