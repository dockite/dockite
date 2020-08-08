import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface BooleanFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldBooleanEntity extends Field {
  settings: BooleanFieldSettings & Field['settings'];
}
