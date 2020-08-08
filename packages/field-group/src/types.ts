import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface DockiteFieldGroupEntity extends Field {
  settings: GroupFieldSettings & Field['settings'];
}

export interface GroupFieldSettings extends FieldSettings {
  required: boolean;
  children: Field[];
  repeatable: boolean;
  minRows: number;
  maxRows: number;
}
