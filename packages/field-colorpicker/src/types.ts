import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface ColorPickerFieldSettings extends FieldSettings {
  required: boolean;
  predefinedColors?: string[];
}

export interface DockiteFieldColorPickerEntity extends BaseField {
  type: 'colorpicker';
  settings: ColorPickerFieldSettings & BaseField['settings'];
}
