import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface StringFieldSettings extends FieldSettings {
  required: boolean;
  urlSafe: boolean;
  textarea: boolean;
  minLen: number;
  maxLen: number;
}

export interface DockiteFieldStringEntity extends Field {
  settings: StringFieldSettings & Field['settings'];
}
