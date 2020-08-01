import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface ConditionalBooleanSettings extends FieldSettings {
  required: boolean;
  fieldsToHide: string[];
  groupsToHide: string[];
}

export interface DockiteFieldConditionalBooleanEntity extends Field {
  settings: ConditionalBooleanSettings & Field['settings'];
}
