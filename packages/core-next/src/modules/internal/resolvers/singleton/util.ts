import pgFormat from 'pg-format';
import { getManager, getRepository } from 'typeorm';

import { BaseField, Document, DocumentRevision, Field, Schema, Singleton } from '@dockite/database';

type WithOldField<T> = T & { oldField: T };

/**
 * Maps each payload field to a relevant singleton field where applicable.
 */
export const mapPayloadFieldsToSingletonFields = (
  fields: Field[],
  payloadFields: BaseField[],
): BaseField[] => {
  return payloadFields.map(field => {
    const found = fields.find(f => {
      // Match on name === name or id === id if applicable
      return f.name === field.name || (field.id && f.id === field.id);
    });

    // If we can't find a matching field on the singleton's fields then we can return
    if (!found) {
      return field;
    }

    return {
      ...field,
      id: found.id,
    };
  });
};

/**
 * Provided the singleton's existing fields and the payload fields, return the subset of fields that have been
 * renamed.
 */
export const getRenamedSingletonFieldsFromPayload = (
  fields: Field[],
  payloadFields: BaseField[],
): WithOldField<BaseField>[] => {
  const fieldsThatHaveBeenRenamed: WithOldField<BaseField>[] = [];

  payloadFields.forEach(field => {
    if (field.id) {
      const found = fields.find(f => f.id === field.id);

      if (found && found.name !== field.name) {
        fieldsThatHaveBeenRenamed.push({
          ...field,
          oldField: found,
        });
      }
    }
  });

  return fieldsThatHaveBeenRenamed;
};

/**
 * Provided the singleton's existing fields and the payload fields, return the subset of fields that no longer
 * exist based on the payload.
 */
export const getDeletedSingletonFieldsFromPayload = (
  fields: Field[],
  payloadFields: BaseField[],
): Field[] => {
  return fields.filter(field => {
    const found = payloadFields.find(f => f.id === field.id);

    // We are only interested in fields that weren't found as
    // they would been deleted
    return !found;
  });
};

/**
 * Provided the singleton's existing fields and the payload fields, return the subset of fields that don't
 * exist on the singleton.
 */
export const getCreatedSingletonFieldsFromPayload = (
  fields: Field[],
  payloadFields: BaseField[],
): BaseField[] => {
  return payloadFields.filter(field => {
    const found = fields.find(f => f.id === field.id);

    // We are only interested in fields that weren't found as
    // they would been deleted
    return !found;
  });
};

/**
 * Updates the relevant documents that will have their data mutated by field additions/removals/updates.
 */
export const updateDocumentsWithFieldChanges = async (
  singleton: Schema,
  fieldsThatHaveBeenRenamed: WithOldField<BaseField>[],
  fieldsThatHaveBeenDeleted: BaseField[],
  fieldsThatHaveBeenCreated: BaseField[],
): Promise<void> => {
  const documentRepository = getRepository(Document);

  // Remove keys that correspond to deleted fields
  await documentRepository
    .createQueryBuilder('document')
    .update()
    .where('document.schemaId = :singletonId', { singletonId: singleton.id })
    .set({
      data: () =>
        pgFormat.withArray(
          `data - ARRAY[%L]`,
          fieldsThatHaveBeenDeleted.map(f => f.name),
        ),
    })
    .callListeners(false)
    .execute();

  // Rename keys that correspond to renamed fields
  await documentRepository
    .createQueryBuilder('document')
    .update()
    .where('document.schemaId = :singletonId', { singletonId: singleton.id })
    // As dirty as this is, its the only way I can think of to neatly deal with this in a SQL safe manner
    .set({
      data: () =>
        [
          pgFormat.withArray(
            'data - ARRAY[%L]',
            fieldsThatHaveBeenRenamed.map(f => f.oldField.name),
          ),
          pgFormat.withArray(
            'jsonb_build_object(%s)',
            fieldsThatHaveBeenRenamed.map(f => `'${f.name}', data->'${f.oldField.name}'`),
          ),
        ].join(' || '),
    })
    .callListeners(false)
    .execute();

  // Create keys that correspond to deleted fields
  await documentRepository
    .createQueryBuilder('document')
    .update()
    .where('document.schemaId = :singletonId', { singletonId: singleton.id })
    .set({
      data: () =>
        pgFormat.withArray(
          `data || jsonb_build_object(%s)`,
          fieldsThatHaveBeenCreated.map(f => `'${f.name}', ${f.settings.default ?? null}`),
        ),
    })
    .callListeners(false)
    .execute();
};

/**
 * Revises all documents for a given singleton. Used in cases of a widespread update that will
 * affect every document such as field modifications.
 */
export const reviseAllDocumentsForSingleton = async (
  singleton: Schema,
  userId: string | null,
): Promise<void> => {
  const documentRepository = getRepository(Document);
  const documentRevisionRepository = getRepository(DocumentRevision);

  await getManager().query(
    pgFormat(
      `
        INSERT INTO %I ("documentId", "data", "userId", "singletonId", "createdAt", "updatedAt")
        SELECT d."id", d."data", %L as "userId", d."schemaId", NOW() as "createdAt", d."updatedAt"
        FROM %I d
        WHERE d."schemaId" = %L
      `,
      documentRevisionRepository.metadata.tableName,
      userId,
      documentRepository.metadata.tableName,
      singleton.id,
    ),
  );
};

/**
 * Create a valid singleton object from a schema with its joined documents
 */
export const createSingletonFromSchemaAndDocuments = (
  schema: Schema,
  document?: Document,
): Singleton => {
  if (document) {
    return { ...schema, data: document.data };
  }

  if (schema.documents && schema.documents.length > 0) {
    const [document] = schema.documents;

    return { ...schema, data: document.data };
  }

  return { ...schema, data: {} };
};
