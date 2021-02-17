import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'variant';

export const defaultOptions: VariantFieldSettings = {
  required: false,
  children: [],
};

export type ChildField = Omit<BaseField, 'id' | 'schema' | 'schemaId' | 'dockiteField'>;

export interface VariantFieldSettings extends FieldSettings {
  required?: boolean;
  children: ChildField[];
}

export interface DockiteFieldVariantEntity extends BaseField {
  type: 'variant';
  settings: VariantFieldSettings & BaseField['settings'];
}
