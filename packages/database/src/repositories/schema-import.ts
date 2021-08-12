import { cloneDeep, differenceBy, omit } from 'lodash';
import { EntityRepository, getManager, getRepository, Repository } from 'typeorm';

import { Document, DocumentRevision, Field, Schema, SchemaRevision } from '../entities';

@EntityRepository(Schema)
export class SchemaImportRepository extends Repository<Schema> {
  public async importSchema(
    schemaId: string | null,
    payload: Schema,
    userId: string,
  ): Promise<Schema | null> {
    const schemaRepository = getRepository(Schema);
    const fieldRepository = getRepository(Field);
    const revisionRepository = getRepository(SchemaRevision);

    let schema: Schema | null = null;

    try {
      if (!(payload.id || schemaId)) {
        throw new Error('No id passed');
      }

      schema = await schemaRepository.findOneOrFail(schemaId ?? payload.id, {
        relations: ['fields'],
      });
    } catch (_) {
      schema = new Schema();
    }

    const schemaFields = schema.fields ?? [];

    const renameFieldPromises: Promise<any>[] = [];

    const fieldsToBeImported = payload.fields.map(field => {
      if (!field.id) {
        const fieldMatch = schemaFields.find(f => f.name === field.name);

        if (fieldMatch) {
          if (fieldMatch.name !== field.name) {
            this.handleRenameField(fieldMatch, field.name);
          }

          return {
            ...field,
            id: fieldMatch.id,
          };
        }
      }

      return field;
    });

    await Promise.all(renameFieldPromises);

    const fieldsToBeDeleted = schemaFields.filter(
      field => !fieldsToBeImported.some(fieldToImport => field.id === fieldToImport.id),
    );

    const newSchema = {
      ...schema,
      ...omit(payload, ['fields']),
      userId,
    };

    if (schemaId) {
      newSchema.id = schemaId;
    }

    if (schemaId) {
      const revision = revisionRepository.create({
        schemaId: schema.id,
        data: cloneDeep({
          ...schema,
          fields: schema.fields.map(field => omit(field, 'dockiteField')),
        }) as Record<string, any>,
        userId: schema.userId ?? '',
      });

      await revisionRepository.save(revision);
    }

    const savedSchema = await schemaRepository.save(newSchema);

    if (differenceBy(schemaFields, fieldsToBeImported).length > 0) {
      await this.handleReviseAllDocuments(savedSchema.id, userId);
    }

    await Promise.all([
      fieldRepository.remove(fieldsToBeDeleted),
      fieldRepository.save(
        fieldsToBeImported.map(field => Object.assign(field, { schemaId: savedSchema.id })),
      ),
    ]);

    return savedSchema;
  }

  private async handleRenameField(oldField: Field, newName: string): Promise<void> {
    await getRepository(Document)
      .createQueryBuilder('document')
      .update()
      .set({
        data: () =>
          `data - '${oldField.name}' || jsonb_build_object('${newName}', data->'${oldField.name}')`,
      })
      .where('schemaId = :schemaId', { schemaId: oldField.schemaId })
      .andWhere('data ? :fieldName', { fieldName: oldField.name })
      .execute();
  }

  private async handleReviseAllDocuments(schemaId: string, userId: string): Promise<void> {
    const documentRepository = getRepository(Document);
    const revisionRepository = getRepository(DocumentRevision);

    // Create the corresponding revisions
    await getManager().query(
      `
        INSERT INTO ${revisionRepository.metadata.tableName} ("documentId", "data", "userId", "schemaId")
        SELECT d."id", d."data", '${userId}' AS "userId", d."schemaId"
        FROM ${documentRepository.metadata.tableName} d
        WHERE d."schemaId" = $1
        `,
      [schemaId],
    );
  }
}
