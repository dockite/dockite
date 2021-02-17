import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'slug';

export const defaultOptions: SlugFieldSettings = {
  required: false,
  fieldsToSlugify: null,
  unique: false,
  autoIncrement: false,
  parent: null,
};

export interface SlugFieldSettings extends FieldSettings {
  required: boolean;
  fieldsToSlugify: string[] | null;
  unique: boolean;
  autoIncrement: boolean;
  parent: string | null;
}

export interface DockiteFieldSlugEntity extends BaseField {
  type: 'slug';
  settings: SlugFieldSettings & BaseField['settings'];
}
