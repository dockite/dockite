import { EntityRepository, getRepository, Repository } from 'typeorm';
import { omit, cloneDeep } from 'lodash';

import { Schema, Field, SchemaRevision } from '../entities';

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

    const fieldsToBeImported = payload.fields.map(field => {
      if (!field.id) {
        const fieldMatch = schemaFields.find(f => f.id === field.id || f.name === field.name);

        if (fieldMatch) {
          // Easier than ignoring the eslint rule
          Object.assign(field, { id: fieldMatch.id });
        }
      }

      return field;
    });

    const fieldsToBeDeleted = schemaFields.filter(
      field =>
        !fieldsToBeImported.some(
          fieldToImport => field.id === fieldToImport.id || fieldToImport.name === field.name,
        ),
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

    await Promise.all([
      fieldRepository.remove(fieldsToBeDeleted),
      fieldRepository.save(
        fieldsToBeImported.map(field => Object.assign(field, { schemaId: savedSchema.id })),
      ),
    ]);

    return savedSchema;
  }
}
