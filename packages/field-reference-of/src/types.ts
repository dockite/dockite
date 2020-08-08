import { Field } from '@dockite/database';

export interface ReferenceOfFieldSettings {
  required: boolean;
  schemaId: string | null;
  fieldName: string | null;
}

export interface DockiteFieldReferenceOfEntity extends Field {
  settings: ReferenceOfFieldSettings & Field['settings'];
}
