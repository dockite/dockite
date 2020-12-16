import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'json';

export const defaultOptions: JSONFieldSettings = {
  required: false,
};

export interface JSONFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldJSONEntity extends BaseField {
  type: 'json';
  settings: JSONFieldSettings & BaseField['settings'];
}
