import { createSchema } from '@dockite/transformer';
import { GraphQLSchema } from 'graphql';
import { getRepository } from 'typeorm';
import { Document, Schema } from '@dockite/database';
import { FieldManager } from '@dockite/manager';

export const createExtraGraphQLSchema = async (): Promise<GraphQLSchema> => {
  const dockiteSchemas = await getRepository(Schema).find({
    where: { deletedAt: null },
    relations: ['fields'],
  });

  const documentRepository = getRepository(Document);

  const dockiteSchemasFiltered = dockiteSchemas.filter(schema => schema.fields.length > 0);

  const schema = await createSchema(dockiteSchemasFiltered, documentRepository, FieldManager);

  return schema;
};
