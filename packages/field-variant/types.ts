import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface VariantFieldSettings extends FieldSettings {
  required: boolean;
  children: Field[];
}

export interface DockiteFieldVariantEntity extends Field {
  settings: VariantFieldSettings & Field['settings'];
}
