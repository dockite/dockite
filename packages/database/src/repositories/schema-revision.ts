import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import { EntityRepository, getRepository, Repository } from 'typeorm';

import { Field, Schema, SchemaRevision } from '../entities';

@EntityRepository(Schema)
export class SchemaRevisionRepository extends Repository<Schema> {
  public async restoreRevision(
    schemaId: string,
    revisionId: string,
    userId: string,
  ): Promise<Schema> {
    const schemaRepository = getRepository(Schema);
    const revisionRepository = getRepository(SchemaRevision);
    const fieldRepository = getRepository(Field);

    const [schema, revision] = await Promise.all([
      schemaRepository.findOneOrFail({ where: { id: schemaId }, relations: ['fields'] }),
      revisionRepository.findOneOrFail({ where: { id: revisionId } }),
    ]);

    schema.fields = schema.fields.map(field => omit(field, ['dockiteField']));

    const newRevision = revisionRepository.create({
      schemaId: schema.id,
      data: cloneDeep(schema) as Record<string, any>,
      userId: schema.userId ?? '',
    });

    const revisionFields: Field[] = revision.data.fields;
    const revisionFieldIds = revisionFields.map(field => field.id);

    const fieldsToBeDeleted = schema.fields.filter(field => !revisionFieldIds.includes(field.id));

    const newSchema = {
      ...omit(revision.data, ['fields']),
      userId,
    };

    const [savedSchema] = await Promise.all([
      schemaRepository.save(newSchema),
      fieldRepository.remove(fieldsToBeDeleted),
      fieldRepository.save(revisionFields),
      revisionRepository.save(newRevision),
    ]);

    return savedSchema;
  }
}
