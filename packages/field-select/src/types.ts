import { BaseField } from '@dockite/database';

export interface SelectFieldSettings {
  required: boolean;
  multiple: boolean;
  options: Record<string, string>;
}

export interface DockiteFieldSelectEntity extends BaseField {
  type: 'select';
  settings: SelectFieldSettings & BaseField['settings'];
}
