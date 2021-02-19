import { Schema } from '../entities';

export interface DockiteFieldInputComponentProps<TValue, TEntity> {
  name: string;
  value?: TValue;
  formData: object;
  fieldConfig: TEntity;
  errors: Record<string, string[]>;
  groups: Record<string, string[]>;
  schema: Schema;
  bulkEditMode: boolean;
}

export interface DockiteFieldSettingsComponentProps<TField, TSchema> {
  modelValue?: Record<string, any>;
  fields: TField[];
  groups: Record<string, string[]>;
  schema: TSchema;
}

export interface DockiteFieldSettingComponentProps<TValue> {
  modelValue: TValue;
  rules: Record<string, any>;
}
