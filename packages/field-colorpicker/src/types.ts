import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'colorpicker';

export const defaultOptions: ColorPickerFieldSettings = {
  required: false,
};

export interface ColorPickerFieldSettings extends FieldSettings {
  required: boolean;
  predefinedColors?: string[];
}

export interface DockiteFieldColorPickerEntity extends BaseField {
  type: 'colorpicker';
  settings: ColorPickerFieldSettings & BaseField['settings'];
}
