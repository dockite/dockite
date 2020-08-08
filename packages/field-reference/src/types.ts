import { Field } from '@dockite/database';

export interface ReferenceFieldSettings {
  required: boolean;
  schemaIds: string[];
}

export interface DockiteFieldReferenceEntity extends Field {
  settings: ReferenceFieldSettings & Field['settings'];
}
