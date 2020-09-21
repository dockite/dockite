import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export type ValidationGroup = string[];

export interface UniqueFieldSettings extends FieldSettings {
  validationGroups: ValidationGroup[];
}

export interface DockiteFieldUniqueEntity extends BaseField {
  type: 'unique';
  settings: UniqueFieldSettings & BaseField['settings'];
}
