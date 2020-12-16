import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'number';

export const defaultOptions: NumberFieldSettings = {
  required: false,
  float: false,
  min: -Infinity,
  max: Infinity,
};

export interface NumberFieldSettings extends FieldSettings {
  required: boolean;
  float: boolean;
  min: number;
  max: number;
}

export interface DockiteFieldNumberEntity extends BaseField {
  type: 'number';
  settings: NumberFieldSettings & BaseField['settings'];
}
