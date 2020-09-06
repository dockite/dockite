import { BaseField } from '@dockite/database';

export interface ReferenceOfFieldSettings {
  required: boolean;
  schemaId: string | null;
  fieldName: string | null;
}

export interface DockiteFieldReferenceOfEntity extends BaseField {
  type: 'reference_of';
  settings: ReferenceOfFieldSettings & BaseField['settings'];
}
