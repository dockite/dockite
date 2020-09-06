import { BaseField } from '@dockite/database';

export interface ConditionalSelectFieldOptionValue {
  value: string | null;
  fieldsToHide: string[];
  groupsToHide: string[];
}

export interface ConditionalSelectFieldSettings {
  required: boolean;
  multiple: boolean;
  options: Record<string, ConditionalSelectFieldOptionValue>;
}

export interface DockiteFieldConditionalSelectEntity extends BaseField {
  type: 'conditional_select';
  settings: ConditionalSelectFieldSettings & BaseField['settings'];
}
