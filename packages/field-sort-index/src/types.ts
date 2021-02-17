import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'sort-index';

export const defaultOptions: SortIndexFieldSettings = {
  parentField: null,
};

export interface SortIndexFieldSettings extends FieldSettings {
  parentField: string | null;
}

export interface DockiteFieldSortIndexEntity extends BaseField {
  type: 'sort-index';
  settings: SortIndexFieldSettings & BaseField['settings'];
}
