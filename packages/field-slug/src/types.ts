import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface SlugFieldSettings extends FieldSettings {
  fieldToSlugify: string | null;
}

export interface DockiteFieldSlugEntity extends Field {
  settings: SlugFieldSettings & Field['settings'];
}