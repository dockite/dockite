import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface VariantFieldSettings extends FieldSettings {
  required: boolean;
  children: BaseField[];
}

export interface DockiteFieldVariantEntity extends BaseField {
  type: 'variant';
  settings: VariantFieldSettings & BaseField['settings'];
}
