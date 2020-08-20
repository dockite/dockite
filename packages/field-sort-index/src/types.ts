import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface SortIndexFieldSettings extends FieldSettings {
  parentField: string | null;
}

export interface DockiteFieldSortIndexEntity extends Field {
  settings: SortIndexFieldSettings & Field['settings'];
}
