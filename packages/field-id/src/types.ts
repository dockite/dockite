import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export const FIELD_TYPE = 'id';

export const defaultOptions: IDFieldSettings = {
  required: false,
  type: 'string',
};

export const AvailableTypes = ['string', 'number'] as const;

export type IDFieldType = typeof AvailableTypes[number];

// We aren't prefixing an interface with "I"
// eslint-disable-next-line
export interface IDFieldSettings extends FieldSettings {
  required: boolean;
  type: IDFieldType;
}

export interface DockiteFieldIDEntity extends BaseField {
  type: 'id';
  settings: IDFieldSettings & BaseField['settings'];
}
