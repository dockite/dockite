import { BaseField } from '@dockite/database';

export interface ConditionalSelectFieldOption {
  label: string;
  value: string;
  fieldsToHide: string[];
  groupsToHide: string[];
}

export interface ConditionalSelectFieldSettings {
  required: boolean;
  multiple: boolean;
  options: ConditionalSelectFieldOption[];
}

export interface DockiteFieldConditionalSelectEntity extends BaseField {
  type: 'conditional_select';
  settings: ConditionalSelectFieldSettings & BaseField['settings'];
}
