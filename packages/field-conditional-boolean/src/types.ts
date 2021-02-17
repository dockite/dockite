import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'conditional-boolean';

export const defaultOptions: ConditionalBooleanFieldSettings = {
  required: false,
  fieldsToHide: [],
  fieldsToShow: [],
  groupsToHide: [],
  groupsToShow: [],
};

export interface ConditionalBooleanFieldSettings extends FieldSettings {
  required: boolean;
  fieldsToHide: string[];
  groupsToHide: string[];
  fieldsToShow: string[];
  groupsToShow: string[];
}

export interface DockiteFieldConditionalBooleanEntity extends BaseField {
  type: 'conditional-boolean';
  settings: ConditionalBooleanFieldSettings & BaseField['settings'];
}
