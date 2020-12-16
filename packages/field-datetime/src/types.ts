import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'datetime';

export const defaultOptions: DateTimeFieldSettings = {
  required: false,
  date: false,
  time: false,
};

export interface DockiteFieldDateTimeEntity extends BaseField {
  type: 'datetime';
  settings: DateTimeFieldSettings & BaseField['settings'];
}

export interface DateTimeFieldSettings extends FieldSettings {
  required: boolean;
  date: boolean;
  time: boolean;
  format?: string;
}
