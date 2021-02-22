import { BaseField } from '@dockite/database';

export const DocumentEntityProperties = [
  'id',
  'locale',
  'data',
  'createdAt',
  'updatedAt',
  'schemaId',
  'schema',
  'release',
  'revisions',
  'user',
];

export interface ReferenceOfFieldSettings {
  required: boolean;
  schemaId: string | null;
  fieldName: string | null;
}

export interface DockiteFieldReferenceOfEntity extends BaseField {
  type: 'reference_of';
  settings: ReferenceOfFieldSettings & BaseField['settings'];
}
