import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface ColorPickerFieldSettings extends FieldSettings {
  required: boolean;
}

export interface DockiteFieldColorPickerEntity extends Field {
  settings: ColorPickerFieldSettings & Field['settings'];
}
