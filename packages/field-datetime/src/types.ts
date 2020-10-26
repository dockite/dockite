import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export interface DockiteFieldDateTimeEntity extends BaseField {
  type: 'datetime';
  settings: DateFieldSettings & BaseField['settings'];
}

export interface DateFieldSettings extends FieldSettings {
  required: boolean;
  date: boolean;
  time: boolean;
  format?: string;
}
