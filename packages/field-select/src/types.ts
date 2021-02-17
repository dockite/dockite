import { BaseField } from '@dockite/database';

export const FIELD_TYPE = 'select';

export const defaultOptions: SelectFieldSettings = {
  required: false,
  multiple: false,
  options: [],
};

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
