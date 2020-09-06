import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface StringFieldSettings extends FieldSettings {
  required: boolean;
  urlSafe: boolean;
  textarea: boolean;
  minLen: number;
  maxLen: number;
}

export interface DockiteFieldStringEntity extends BaseField {
  type: 'string';
  settings: StringFieldSettings & BaseField['settings'];
}
