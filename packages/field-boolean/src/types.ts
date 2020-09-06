import { FieldSettings } from '@dockite/types';
import { BaseField } from '@dockite/database';

export interface BooleanFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldBooleanEntity extends BaseField {
  type: 'boolean';
  settings: BooleanFieldSettings & BaseField['settings'];
}
