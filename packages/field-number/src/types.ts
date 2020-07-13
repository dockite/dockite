import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface NumberFieldSettings extends FieldSettings {
  required: boolean;
  float: boolean;
  min: number;
  max: number;
}

export interface DockiteFieldNumberEntity extends Field {
  settings: NumberFieldSettings & Field['settings'];
}
