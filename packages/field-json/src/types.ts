import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface JSONFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldJSONEntity extends Field {
  settings: JSONFieldSettings & Field['settings'];
}
