import { Field } from '@dockite/database';

export interface SelectFieldSettings {
  required: boolean;
  multiple: boolean;
  options: Record<string, string>;
}

export interface DockiteFieldSelectEntity extends Field {
  settings: SelectFieldSettings;
}
