import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const AvailableTypes = ['string', 'number'] as const;

export type IDFieldType = typeof AvailableTypes[number];

export interface IDFieldSettings extends FieldSettings {
  required: boolean;
  type: IDFieldType;
}

export interface DockiteFieldIDEntity extends BaseField {
  type: 'id';
  settings: IDFieldSettings & BaseField['settings'];
}
