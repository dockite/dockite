import { BaseField, Field } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface DockiteFieldGroupEntity extends BaseField {
  type: 'group';
  settings: GroupFieldSettings & BaseField['settings'];
}

export interface GroupFieldSettings extends FieldSettings {
  required: boolean;
  children: Field[];
  repeatable: boolean;
  minRows: number;
  maxRows: number;
}
