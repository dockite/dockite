import { Schema } from '../entities';

export interface DockiteFieldInputComponentProps<TValue, TEntity> {
  name: string;
  value?: TValue;
  formData: Record<string, any>;
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

export interface DockiteFieldViewComponentProps<TField> {
  modelValue?: any;
  field: TField;
}
