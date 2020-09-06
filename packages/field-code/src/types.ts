import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface CodeFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldCodeEntity extends BaseField {
  type: 'code';
  settings: CodeFieldSettings & BaseField['settings'];
}
