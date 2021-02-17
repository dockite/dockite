import { BaseField, Document } from '@dockite/database';

export const FIELD_TYPE = 'reference-of';

export const RESULTS_PER_PAGE = 25;

export const defaultOptions: ReferenceOfFieldSettings = {
  required: false,
  schemaId: null,
  fieldName: null,
};

export interface GraphQLResult<T> {
  data: T;
}

export interface DocumentTableColumnDefaultScopedSlot {
  $index: number;
  row: Document;
  column: any;
}

export interface ReferenceOfFieldSettings {
  required: boolean;
  schemaId: string | null;
  fieldName: string | null;
}

export interface DockiteFieldReferenceOfEntity extends BaseField {
  type: 'reference-of';
  settings: ReferenceOfFieldSettings & BaseField['settings'];
}
