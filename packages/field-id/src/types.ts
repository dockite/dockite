import { FieldSettings } from '@dockite/types';
import { Field } from '@dockite/database';

export const AvailableTypes = ['string', 'number'] as const;

export type IDFieldType = typeof AvailableTypes[number];

export interface IDFieldSettings extends FieldSettings {
  required: boolean;
  type: IDFieldType;
}

export interface DockiteFieldIDEntity extends Field {
  settings: IDFieldSettings & Field['settings'];
}
