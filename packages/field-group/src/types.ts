import { FieldSettings, Field } from '@dockite/types';

export interface DockiteFieldGroupEntity extends Field {
  settings: GroupFieldSettings & Field['settings'];
}

export interface GroupFieldSettings extends FieldSettings {
  required: boolean;
  repeatable: boolean;
  minRows: number;
  maxRows: number;
}
