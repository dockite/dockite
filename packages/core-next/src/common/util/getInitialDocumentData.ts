import { Schema } from '@dockite/database';

/**
 * Provided a documents schema which contains its corresponding field, generate the initial data for a
 * document providing every field a default value.
 *
 * Default values will be assigned on a priority basis of:
 *
 * 1. User provided default
 * 2. Field provided default
 * 3. System default {null}
 */
export const getInitialDocumentData = (schema: Schema): Record<string, any> => {
  // Construct an empty data object for assignment
  const data: Record<string, any> = {};

  // For each field we will attempt to assign a default value falling back to null
  schema.fields.forEach(field => {
    if (field.dockiteField) {
      data[field.name] = field.settings.default ?? field.dockiteField.defaultValue() ?? null;
    } else {
      data[field.name] = field.settings.default ?? null;
    }
  });

  return data;
};

export default getInitialDocumentData;
