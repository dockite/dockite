import { BaseField } from '@dockite/database';

export interface SelectFieldOptionItem {
  label: string;
  value: string;
}

export interface SelectFieldSettings {
  required: boolean;
  multiple: boolean;
  options: SelectFieldOptionItem[];
}

export interface DockiteFieldSelectEntity extends BaseField {
  type: 'select';
  settings: SelectFieldSettings & BaseField['settings'];
}
