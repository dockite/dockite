import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'code';

export const defaultOptions: CodeFieldSettings = {
  required: false,
};

export interface CodeFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldCodeEntity extends BaseField {
  type: 'code';
  settings: CodeFieldSettings & BaseField['settings'];
}
