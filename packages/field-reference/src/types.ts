import { BaseField, Document } from '@dockite/database';
import { Constraint } from '@dockite/where-builder';

export const FIELD_TYPE = 'reference';

export const RESULTS_PER_PAGE = 25;

export const defaultOptions: ReferenceFieldSettings = {
  required: false,
  schemaIds: [],
  fieldsToDisplay: [],
  constraints: [],
};

export type ReferenceFieldValue = ReferenceFieldPopulatedValue | null;

export interface GraphQLResult<T> {
  data: T;
}

export interface ReferenceFieldPopulatedValue {
  id: string;
  schemaId: string;
  identifier?: string;
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

export interface DocumentTableColumnDefaultScopedSlot {
  $index: number;
  row: Document;
  column: any;
}

export interface DockiteFieldReferenceEntity extends BaseField {
  type: 'reference';
  settings: ReferenceFieldSettings & BaseField['settings'];
}
