import { BaseField } from '@dockite/database';

export interface ReferenceFieldSettings {
  required: boolean;
  schemaIds: string[];
  fieldsToDisplay?: FieldToDisplayItem[];
}

export interface FieldToDisplayItem {
  label: string;
  name: string;
}

export interface DockiteFieldReferenceEntity extends BaseField {
  type: 'reference';
  settings: ReferenceFieldSettings & BaseField['settings'];
}
