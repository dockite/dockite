import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export type ValidationGroup = string[];

export interface UniqueFieldSettings extends FieldSettings {
  validationGroups: ValidationGroup[];
  constraints: Constraint[][];
}

export interface DockiteFieldUniqueEntity extends BaseField {
  type: 'unique';
  settings: UniqueFieldSettings & BaseField['settings'];
}

export interface Constraint {
  name: string;
  operator: '$eq' | '$ne';
  value: any;
}
