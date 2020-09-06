import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface JSONFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldJSONEntity extends BaseField {
  type: 'json';
  settings: JSONFieldSettings & BaseField['settings'];
}
