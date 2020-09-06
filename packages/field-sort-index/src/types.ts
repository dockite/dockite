import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface SortIndexFieldSettings extends FieldSettings {
  parentField: string | null;
}

export interface DockiteFieldSortIndexEntity extends BaseField {
  type: 'sort-index';
  settings: SortIndexFieldSettings & BaseField['settings'];
}
