import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'string';

export const defaultOptions: StringFieldSettings = {
  required: false,
  textarea: false,
  urlSafe: false,
  minLen: 0,
  maxLen: 0,
};

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
