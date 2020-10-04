import { BaseField } from '@dockite/database';
import { FieldSettings } from '@dockite/types';

export enum ProcessMethodType {
  INPUT_GRAPHQL = 'INPUT_GRAPHQL',
  OUTPUT_GRAPHQL = 'OUTPUT_GRAPHQL',
  INPUT_RAW = 'INPUT_RAW',
  OUTPUT_RAW = 'OUTPUT_RAW',
}

export type FieldHookMethod = 'onCreate' | 'onUpdate' | 'onSoftDelete' | 'onPermanentDelete';

export interface DockiteFieldGroupEntity extends BaseField {
  type: 'group';
  settings: GroupFieldSettings & BaseField['settings'];
}

export type ChildField = Omit<BaseField, 'id' | 'schema' | 'schemaId' | 'dockiteField'>;

export interface GroupFieldSettings extends FieldSettings {
  required: boolean;
  children: ChildField[];
  repeatable: boolean;
  minRows: number;
  maxRows: number;
}
