import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface ConditionalBooleanSettings extends FieldSettings {
  required: boolean;
  fieldsToHide: string[];
  groupsToHide: string[];
}

export interface DockiteFieldConditionalBooleanEntity extends BaseField {
  type: 'conditional_boolean';
  settings: ConditionalBooleanSettings & BaseField['settings'];
}
