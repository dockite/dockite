import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export interface DockiteFieldDateTimeEntity extends Field {
  settings: DateFieldSettings & Field['settings'];
}

export interface DateFieldSettings extends FieldSettings {
  required: boolean;
  dateOnly: boolean;
}
