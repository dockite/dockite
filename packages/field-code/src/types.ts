import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface CodeFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldCodeEntity extends Field {
  settings: CodeFieldSettings & Field['settings'];
}
