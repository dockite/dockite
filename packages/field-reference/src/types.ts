import { BaseField } from '@dockite/database';
import { Constraint } from '@dockite/where-builder';

export interface ReferenceFieldValue {
  identifier: string;
  id: string;
  schemaId: string;
}

export interface ReferenceFieldSettings {
  required: boolean;
  schemaIds: string[];
  fieldsToDisplay?: FieldToDisplayItem[];
  constraints?: Constraint[];
}

export interface FieldToDisplayItem {
  label: string;
  name: string;
}

export interface DockiteFieldReferenceEntity extends BaseField {
  type: 'reference';
  settings: ReferenceFieldSettings & BaseField['settings'];
}
