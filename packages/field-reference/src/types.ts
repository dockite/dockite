import { BaseField } from '@dockite/database';

export interface ReferenceFieldSettings {
  required: boolean;
  schemaIds: string[];
}

export interface DockiteFieldReferenceEntity extends BaseField {
  type: 'reference';
  settings: ReferenceFieldSettings & BaseField['settings'];
}
