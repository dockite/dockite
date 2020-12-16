import { FieldSettings } from '@dockite/types';
import { BaseField } from '@dockite/database';

export const FIELD_TYPE = 'boolean';

export interface BooleanFieldSettings extends FieldSettings {
  required: boolean;
}

export const defaultOptions: BooleanFieldSettings = {
  required: false,
};

export interface DockiteFieldBooleanEntity extends BaseField {
  type: 'boolean';
  settings: BooleanFieldSettings & BaseField['settings'];
}
