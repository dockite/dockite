import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface SlugFieldSettings extends FieldSettings {
  fieldToSlugify: string | null;
  unique: boolean;
  parent: string | null;
}

export interface DockiteFieldSlugEntity extends BaseField {
  type: 'slug';
  settings: SlugFieldSettings & BaseField['settings'];
}
